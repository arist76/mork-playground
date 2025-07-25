"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OutputViewer } from "@/components/output-viewer"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Database, TestTube } from "lucide-react"
import { testNeo4jConnection, loadNeo4jData, isPathClear, exportData } from "@/lib/mork-api"

export function Neo4jCommand() {
  const [uri, setUri] = useState("bolt://localhost:7687")
  const [user, setUser] = useState("neo4j")
  const [password, setPassword] = useState("")
  const [loadType, setLoadType] = useState("triples")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPollingConnection, setIsPollingConnection] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPollingLoad, setIsPollingLoad] = useState(false)
  const connectionPollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const loadPollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [loadResult, setLoadResult] = useState<any>(null)
  const { toast } = useToast()

  const handleTestConnection = async () => {
    if (!uri.trim() || !user.trim() || !password.trim()) {
      toast({
        title: "Validation Error",
        description: "URI, username, and password are required",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    setConnectionResult(null) // Clear previous results
    try {
      const response = await testNeo4jConnection(uri, user, password)

      if (response.status === "success") {
        toast({
          title: "Connection Initiated",
          description: response.message,
        })
      } else {
        toast({
          title: "Connection Failed",
          description: response.message || "Failed to connect to Neo4j database",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleLoadData = async () => {
    if (!connectionResult) {
      toast({
        title: "Connection Required",
        description: "Please establish a connection first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setLoadResult(null) // Clear previous results
    try {
      const response = await loadNeo4jData(loadType)

      if (response.status === "success") {
        toast({
          title: "Load Initiated",
          description: response.message,
        })
      } else {
        toast({
          title: "Load Failed",
          description: response.message || "Failed to load data into Neo4j",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CommandCard
      title="Neo4j Integration"
      description="Configure Neo4j database connection and load data in various formats."
      isUnderConstruction={true}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Database Connection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="neo4j-uri">Neo4j URI</Label>
              <Input
                id="neo4j-uri"
                value={uri}
                onChange={(e) => setUri(e.target.value)}
                placeholder="bolt://localhost:7687"
                disabled={isConnecting || isPollingConnection || isLoading || isPollingLoad}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neo4j-user">Username</Label>
              <Input
                id="neo4j-user"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="neo4j"
                disabled={isConnecting || isPollingConnection || isLoading || isPollingLoad}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="neo4j-password">Password</Label>
            <Input
              id="neo4j-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isConnecting || isPollingConnection || isLoading || isPollingLoad}
            />
          </div>

          <Button
            onClick={handleTestConnection}
            disabled={isConnecting || isPollingConnection || isLoading || isPollingLoad || !uri.trim() || !user.trim() || !password.trim()}
            className="w-40"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : isPollingConnection ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Waiting for connection...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        {connectionResult && <OutputViewer title="Connection Result" data={connectionResult} status={connectionResult.error ? "error" : "success"} />}

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Data Loading</h3>
          <div className="space-y-2">
            <Label htmlFor="load-type">Load Type</Label>
            <Select value={loadType} onValueChange={setLoadType} disabled={isConnecting || isPollingConnection || isLoading || isPollingLoad}>
              <SelectTrigger id="load-type">
                <SelectValue placeholder="Select load type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="triples">Triples</SelectItem>
                <SelectItem value="node-properties">Node Properties</SelectItem>
                <SelectItem value="labels">Labels</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {loadType === "triples" && "Load data as RDF triples (subject-predicate-object)"}
              {loadType === "node-properties" && "Load data as node properties"}
              {loadType === "labels" && "Load data as node labels"}
            </p>
          </div>

          <Button onClick={handleLoadData} disabled={isConnecting || isPollingConnection || isLoading || isPollingLoad || !connectionResult} className="w-32">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Load Data
              </>
            )}
          </Button>
        </div>

        {loadResult && <OutputViewer title="Load Result" data={loadResult} status={loadResult.error ? "error" : "success"} />}
      </div>
    </CommandCard>
  )
}
