"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OutputViewer } from "@/components/output-viewer"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Database, TestTube } from "lucide-react"

export function Neo4jCommand() {
  const [uri, setUri] = useState("bolt://localhost:7687")
  const [user, setUser] = useState("neo4j")
  const [password, setPassword] = useState("")
  const [loadType, setLoadType] = useState("triples")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockResult = {
        status: "success",
        uri: uri,
        user: user,
        connected_at: new Date().toISOString(),
        neo4j_version: "5.15.0",
        database: "neo4j",
        message: "Successfully connected to Neo4j database",
      }
      setConnectionResult(mockResult)
      toast({
        title: "Connection Successful",
        description: "Successfully connected to Neo4j database",
      })
    } catch (error) {
      setConnectionResult({ status: "error", message: "Failed to connect to Neo4j" })
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Neo4j database",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleLoadData = async () => {
    if (!connectionResult || connectionResult.status !== "success") {
      toast({
        title: "Connection Required",
        description: "Please establish a connection first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      const mockResult = {
        status: "success",
        load_type: loadType,
        nodes_created: 156,
        relationships_created: 234,
        properties_set: 890,
        execution_time: "2.34s",
        message: `Successfully loaded data as ${loadType}`,
      }
      setLoadResult(mockResult)
      toast({
        title: "Data Loaded",
        description: `Successfully loaded data as ${loadType}`,
      })
    } catch (error) {
      setLoadResult({ status: "error", message: "Failed to load data" })
      toast({
        title: "Load Failed",
        description: "Failed to load data into Neo4j",
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
                disabled={isConnecting || isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neo4j-user">Username</Label>
              <Input
                id="neo4j-user"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="neo4j"
                disabled={isConnecting || isLoading}
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
              disabled={isConnecting || isLoading}
            />
          </div>

          <Button
            onClick={handleTestConnection}
            disabled={isConnecting || isLoading || !uri.trim() || !user.trim() || !password.trim()}
            className="w-40"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        {connectionResult && (
          <OutputViewer
            title="Connection Result"
            data={connectionResult}
            status={connectionResult.status === "success" ? "success" : "error"}
          />
        )}

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Data Loading</h3>
          <div className="space-y-2">
            <Label htmlFor="load-type">Load Type</Label>
            <Select value={loadType} onValueChange={setLoadType} disabled={isConnecting || isLoading}>
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

          <Button
            onClick={handleLoadData}
            disabled={isConnecting || isLoading || !connectionResult || connectionResult.status !== "success"}
            className="w-32"
          >
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

        {loadResult && (
          <OutputViewer
            title="Load Result"
            data={loadResult}
            status={loadResult.status === "success" ? "success" : "error"}
          />
        )}
      </div>
    </CommandCard>
  )
}
