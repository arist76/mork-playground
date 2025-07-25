#!/bin/bash
set -euo pipefail  # Stricter error handling

DOCKER_REPO="surafelfikru/mork-playground"

# Function to show usage
show_help() {
  echo "Usage: $0 [OPTIONS]"
  echo "Builds and pushes Docker images for the mork-playground application."
  echo ""
  echo "Options:"
  echo "  --version-type <type>  Type of version increment (major, minor, patch). Default: minor"
  echo "  --git-commit <hash>    Git commit hash to tag the image with. Default: last commit from Docker Hub or current HEAD"
  echo "  --is-latest <bool>     Whether to tag the image as 'latest'. Default: true"
  echo "  -h, --help             Show this help message and exit"
  exit 0
}

# Default values
VERSION_TYPE="minor"
GIT_COMMIT="" # Will be determined later
IS_LATEST="true"

# Parse arguments
TEMP=$(getopt -o h --long version-type:,git-commit:,is-latest:,help -n 'docker-build.sh' -- "$@")
if [ $? -ne 0 ]; then
    echo "Error: Failed to parse options." >&2
    show_help
fi

eval set -- "$TEMP"

while true; do
  case "$1" in
    --version-type)
      VERSION_TYPE="$2"
      shift 2
      ;;
    --git-commit)
      GIT_COMMIT="$2"
      shift 2
      ;;
    --is-latest)
      IS_LATEST="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      ;;
    --)
      shift
      break
      ;;
    *)
      echo "Internal error!" >&2
      exit 1
      ;;
  esac
done

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
  echo "Error: Invalid version type '$VERSION_TYPE'. Must be major, minor, or patch."
  show_help
fi

# Validate is_latest
if [[ ! "$IS_LATEST" =~ ^(true|false)$ ]]; then
  echo "Error: is_latest must be 'true' or 'false'"
  show_help
fi

# Function to get previous version and last commit tag from Docker Hub
get_docker_tags() {
  local tags_json
  if ! tags_json=$(curl -s "https://hub.docker.com/v2/repositories/${DOCKER_REPO}/tags/?page_size=100"); then
    echo "v0.0.0" # Default if API fails
    echo ""     # No commit tag
    return
  fi

  local prev_version=$(echo "$tags_json" | jq -r '.results[].name' | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -n 1 || echo "v0.0.0")
  local last_commit_tag=$(echo "$tags_json" | jq -r '.results[].name' | grep -E '^mork-[a-f0-9]{8}$' | sort -r | head -n 1 || echo "")

  echo "$prev_version"
  echo "$last_commit_tag"
}

# Determine GIT_COMMIT if not provided
if [ -z "$GIT_COMMIT" ]; then
  echo "Attempting to determine default git commit..."
  read PREV_VERSION LAST_COMMIT_TAG <<< $(get_docker_tags) # Read into two variables
  if [ -n "$LAST_COMMIT_TAG" ]; then
    GIT_COMMIT="${LAST_COMMIT_TAG#mork-}"
    echo "Using last commit from Docker Hub: $GIT_COMMIT"
  else
    GIT_COMMIT=$(git rev-parse HEAD)
    echo "Could not find last commit from Docker Hub. Using current HEAD: $GIT_COMMIT"
  fi
else
  # Validate git commit format if provided
  if [[ ! "$GIT_COMMIT" =~ ^[a-f0-9]+$ ]]; then
    echo "Error: Invalid git commit hash '$GIT_COMMIT'"
    show_help
  fi
fi

# Increment version based on type
increment_version() {
  local version=$1
  local type=$2
  
  # Remove 'v' prefix if exists
  version=${version#v}
  
  IFS='.' read -r major minor patch <<< "$version"
  
  case "$type" in
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    patch)
      patch=$((patch + 1))
      ;;
  esac
  
  echo "v${major}.${minor}.${patch}"
}

# Main execution
main() {
  echo "=== Starting Docker build and push ==="
  
  # If PREV_VERSION is not set yet (i.e., GIT_COMMIT was provided as an argument),
  # get it now. Otherwise, it's already set by the default GIT_COMMIT logic.
  if [ -z "${PREV_VERSION:-}" ]; then
    read PREV_VERSION _ <<< $(get_docker_tags)
  fi

  NEW_VERSION=$(increment_version "$PREV_VERSION" "$VERSION_TYPE")
  COMMIT_TAG="mork-${GIT_COMMIT:0:8}"  # Use first 8 chars of commit hash

  echo "Previous version: $PREV_VERSION"
  echo "New version: $NEW_VERSION"
  echo "Commit tag: $COMMIT_TAG"
  echo "Mark as latest: $IS_LATEST"

  # Build with appropriate tags
  TAGS_ARGS="-t ${DOCKER_REPO}:${NEW_VERSION} -t ${DOCKER_REPO}:${COMMIT_TAG}"

  if [ "$IS_LATEST" = "true" ]; then
    TAGS_ARGS+=" -t ${DOCKER_REPO}:latest"
  fi

  # Build the image
  echo "Building Docker image..."
  if ! docker build ${TAGS_ARGS} . ; then
    echo "Error: Docker build failed"
    exit 1
  fi

  # Push the images
  echo "Pushing images..."
  for TAG in ${TAGS_ARGS//-t /};
  do
    if [[ "$TAG" == *" "* ]]; then # Skip if it's not a single tag (i.e., part of a multi-tag string)
      continue
    fi
    echo "Pushing tag: $TAG"
    docker push "$TAG"
  done

  echo "=== Successfully pushed images ==="
  echo "- ${DOCKER_REPO}:${NEW_VERSION}"
  echo "- ${DOCKER_REPO}:${COMMIT_TAG}"
  [ "$IS_LATEST" = "true" ] && echo "- ${DOCKER_REPO}:latest"
}

# Run main function
main