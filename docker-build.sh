#!/bin/bash
set -e  # Exit on error

# Validate arguments
if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <version_type> <git_commit> <is_latest>"
  echo "Example: $0 minor abc123 true"
  exit 1
fi

VERSION_TYPE=$1
GIT_COMMIT=$2
IS_LATEST=$3
DOCKER_REPO="surafelfikru/mork-playground"

# Get previous version tags from Docker Hub
function get_previous_version() {
  local tags=$(curl -s "https://hub.docker.com/v2/repositories/${DOCKER_REPO}/tags/?page_size=100" | jq -r '.results[].name')
  echo "$tags" | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -n 1 || echo "v0.0.0"
}

# Increment version based on type
function increment_version() {
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
    *)
      echo "Invalid version type: $type. Use major, minor, or patch."
      exit 1
      ;;
  esac
  
  echo "v${major}.${minor}.${patch}"
}

# Main script
PREV_VERSION=$(get_previous_version)
NEW_VERSION=$(increment_version "$PREV_VERSION" "$VERSION_TYPE")
COMMIT_TAG="commit-${GIT_COMMIT:0:8}"  # Use first 8 chars of commit hash

echo "Previous version: $PREV_VERSION"
echo "New version: $NEW_VERSION"
echo "Commit tag: $COMMIT_TAG"
echo "Mark as latest: $IS_LATEST"

# Build with appropriate tags
TAGS=("-t ${DOCKER_REPO}:${NEW_VERSION}" "-t ${DOCKER_REPO}:${COMMIT_TAG}")

if [ "$IS_LATEST" = "true" ]; then
  TAGS+=("-t ${DOCKER_REPO}:latest")
fi

# Build the image
echo "Building Docker image with tags: ${TAGS[*]}"
docker build ${TAGS[@]} .

# Push the images
echo "Pushing version tag: $NEW_VERSION"
docker push "${DOCKER_REPO}:${NEW_VERSION}"

echo "Pushing commit tag: $COMMIT_TAG"
docker push "${DOCKER_REPO}:${COMMIT_TAG}"

if [ "$IS_LATEST" = "true" ]; then
  echo "Pushing latest tag"
  docker push "${DOCKER_REPO}:latest"
fi

echo "Successfully pushed images:"
echo "- ${DOCKER_REPO}:${NEW_VERSION}"
echo "- ${DOCKER_REPO}:${COMMIT_TAG}"
[ "$IS_LATEST" = "true" ] && echo "- ${DOCKER_REPO}:latest"
