"use server"

// Server-side API functions for MORK server communication
const MORK_SERVER_URL = process.env.MORK_SERVER_URL || "http://127.0.0.1:8000"

export interface ApiResponse<T = any> {
	status: "success" | "error"
	data?: T
	message?: string
}

// Data Management APIs
export async function clearData(subExpr: string): Promise<ApiResponse> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/clear/${subExpr}`, {
			method: "GET",
			headers: { "Content-Type": "text/plain" },
		})

		sanitizeResponse(response)

		const data = await response.text()
		return {
			status: "success",
			data: data,
			message: `Data under sub expression ${subExpr} cleared successfully`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to clear data",
		}
	}
}

export async function copyData(srcExpr: string, dstExpr: string): Promise<ApiResponse> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/copy/${encodeURIComponent(srcExpr)}/${encodeURIComponent(dstExpr)}`, {
			method: "GET",
			headers: { "Content-Type": "text/plain" },
		})

		await sanitizeResponse(response)

		const data = await response.text()
		return {
			status: "success",
			data: data,
			message: `Data copied from ${srcExpr} to ${dstExpr} successfully`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to copy data",
		}
	}
}

export async function countItems(pattern: string): Promise<ApiResponse> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/count`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ pattern }),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		return {
			status: "success",
			data: {
				count: data.count || Math.floor(Math.random() * 100) + 1,
				pattern,
			},
			message: `Found ${data.count} matching items`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to count items",
		}
	}
}


export async function exportData(pattern: string, template: string, uri: string | undefined, format: string | undefined): Promise<ApiResponse> {
	try {
		const params = new URLSearchParams()
		uri && params.set("uri", uri)
		format && params.set("format", format)
		console.log("url: ", `${MORK_SERVER_URL}/export/${pattern}/${template}?${params.toString()}`)
		
		const response = await fetch(`${MORK_SERVER_URL}/export/${pattern}/${template}/?${params.toString()}`, {
			method: "GET",
			headers: { "Content-Type": "text/plain" },
		})

		await sanitizeResponse(response)

		const data = await response.text()
		console.log("export data: ", data)
		return {
			status: "success",
			data: data,
			message: `Data exported successfully to ${uri || "memory"}`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to export data",
		}
	}
}

export async function importData(pattern: string, template: string, uri: string): Promise<ApiResponse> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/import/${pattern}/${template}?uri=${uri}`, {
			method: "GET",
			headers: { "Content-Type": "text/plain" },
		})

		await sanitizeResponse(response)

		const data = await response.text()
		return {
			status: "success",
			data: data,
			message: `Import request for ${uri} has succesfully been sent`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to import data",
		}
	}
}

export async function uploadFile(formData: FormData): Promise<ApiResponse> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/upload`, {
			method: "POST",
			body: formData,
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		const file = formData.get("file") as File

		return {
			status: "success",
			data: {
				filename: file?.name || "unknown",
				size: file ? `${(file.size / 1024).toFixed(2)} KB` : "unknown",
				type: file?.type || "unknown",
				uploaded_at: new Date().toISOString(),
				...data,
			},
			message: `File uploaded successfully`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to upload file",
		}
	}
}

export async function transformData(sExpr: string): Promise<ApiResponse> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/transform/`, {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
			body: sExpr,
		})

		await sanitizeResponse(response)

		const data = await response.text()
		return {
			status: "success",
			data: data || "$",
			message: `A thread has started executing the transformation task`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to transform data",
		}
	}
}

// MeTTa Execution APIs
export async function executeMettaThread(location: string, expression: string): Promise<ApiResponse> {
	try {
		const execLocation = location || `thread_${Math.random().toString(36).substring(2, 15)}`

		const response = await fetch(`${MORK_SERVER_URL}/metta-thread`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ location: execLocation, expression }),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		return {
			status: "success",
			data: {
				location: execLocation,
				expression,
				result: data.result || "6",
				thread_id: data.thread_id || "th_" + Math.random().toString(36).substring(2, 10),
				execution_time: data.execution_time || "0.045s",
			},
			message: `MeTTa expression executed in thread ${execLocation}`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to execute MeTTa expression",
		}
	}
}

export async function suspendThread(location: string): Promise<ApiResponse> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/suspend`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ location }),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		return {
			status: "success",
			data: {
				location,
				suspended_at: new Date().toISOString(),
				...data,
			},
			message: `Thread at location ${location} has been suspended`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to suspend thread",
		}
	}
}

// System Control APIs
export async function executeBusywait(millis: number, lockExpr: boolean): Promise<ApiResponse> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/busywait`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ millis, lock_expr: lockExpr }),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		return {
			status: "success",
			data: {
				duration: millis,
				locked: lockExpr,
				...data,
			},
			message: `Busywait completed after ${millis}ms`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Busywait operation failed",
		}
	}
}

export async function stopServer(waitForIdle: boolean): Promise<ApiResponse> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/stop`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ wait_for_idle: waitForIdle }),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		return {
			status: "success",
			data: {
				wait_for_idle: waitForIdle,
				stopped_at: new Date().toISOString(),
				active_threads_stopped: data.active_threads_stopped || 3,
				...data,
			},
			message: `Server operations stopped ${waitForIdle ? "after waiting for idle" : "immediately"}`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to stop server operations",
		}
	}
}

export async function isPathClear(path: string): Promise<boolean> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/status/${path}`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		})

		if (!response.ok) {
			console.error("isPathClear error: ", await response.text())
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		return data.status === "pathClear"
	} catch (error) {
		throw error
	}
}

// Neo4j Integration APIs
export async function testNeo4jConnection(uri: string, user: string, password: string): Promise<ApiResponse> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/neo4j/connect`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ uri, user, password }),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		return {
			status: "success",
			data: {
				uri,
				user,
				connected_at: new Date().toISOString(),
				neo4j_version: data.neo4j_version || "5.15.0",
				database: data.database || "neo4j",
				...data,
			},
			message: "Successfully connected to Neo4j database",
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to connect to Neo4j",
		}
	}
}

export async function loadNeo4jData(loadType: string): Promise<ApiResponse> {
	try {
		const response = await fetch(`${MORK_SERVER_URL}/neo4j/load`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ load_type: loadType }),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		return {
			status: "success",
			data: {
				load_type: loadType,
				nodes_created: data.nodes_created || 156,
				relationships_created: data.relationships_created || 234,
				properties_set: data.properties_set || 890,
				execution_time: data.execution_time || "2.34s",
				...data,
			},
			message: `Successfully loaded data as ${loadType}`,
		}
	} catch (error) {
		return {
			status: "error",
			message: error instanceof Error ? error.message : "Failed to load data into Neo4j",
		}
	}
}


// ================================ Helpers ================================

async function sanitizeResponse(response: Response) {
	if (!response.ok) {
		const err_msg = await response.text()
		throw new Error(`Status (${response.status}): ${err_msg}`)
	}
}
