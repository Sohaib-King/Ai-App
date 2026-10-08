package com.aura.ai

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * ModelManager: Orchestrates offline vs online execution for Aura AI.
 * Handles mode selection (Hybrid, Offline Only, Cloud Preferred),
 * monitors network states, measures latency, and coordinates with Gemini API endpoints.
 */
class ModelManager(private val context: Context) {

    enum class ExecutionMode {
        HYBRID,         // Auto-route: local rules first, fallback to cloud
        OFFLINE_ONLY,   // Strict offline: zero network requests
        CLOUD_PREFER    // Cloud-first for deep reasoning, offline fallback if disconnected
    }

    data class ModelResponse(
        val text: String,
        val source: String, // "⚡ Offline Engine" or "☁️ Gemini 3.8 Flash"
        val latencyMs: Long,
        val confidence: Double
    )

    private val offlineRouter = OfflineRouter()
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    var currentMode: ExecutionMode = ExecutionMode.HYBRID
    var cloudApiEndpoint: String = "https://aura-ai-backend.run.app/api/chat"

    fun isNetworkAvailable(): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
        val activeNetwork = cm.activeNetwork ?: return false
        val capabilities = cm.getNetworkCapabilities(activeNetwork) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    suspend fun executeQuery(query: String, apiKey: String? = null): ModelResponse = withContext(Dispatchers.IO) {
        val start = System.currentTimeMillis()

        when (currentMode) {
            ExecutionMode.OFFLINE_ONLY -> {
                val offline = offlineRouter.processQuery(query)
                val elapsed = System.currentTimeMillis() - start
                if (offline.isHandled) {
                    ModelResponse(offline.response, "⚡ Offline Engine", elapsed, offline.confidence)
                } else {
                    ModelResponse(
                        "⚠️ Offline Only Mode is active. Aura AI cannot reach cloud for complex reasoning. Switch to Hybrid mode or ask a local offline question.",
                        "⚡ Offline Engine",
                        elapsed,
                        0.5
                    )
                }
            }

            ExecutionMode.CLOUD_PREFER -> {
                if (isNetworkAvailable()) {
                    try {
                        val cloudReply = requestCloudGemini(query, apiKey)
                        val elapsed = System.currentTimeMillis() - start
                        ModelResponse(cloudReply, "☁️ Gemini 3.8 Flash", elapsed, 0.98)
                    } catch (e: Exception) {
                        // Fallback to offline on failure
                        val offline = offlineRouter.processQuery(query)
                        val elapsed = System.currentTimeMillis() - start
                        if (offline.isHandled) {
                            ModelResponse(offline.response, "⚡ Offline Engine (Network Fallback)", elapsed, offline.confidence)
                        } else {
                            ModelResponse("Error: Unable to reach Gemini cloud (${e.localizedMessage}).", "☁️ Cloud Error", elapsed, 0.0)
                        }
                    }
                } else {
                    val offline = offlineRouter.processQuery(query)
                    val elapsed = System.currentTimeMillis() - start
                    if (offline.isHandled) {
                        ModelResponse(offline.response, "⚡ Offline Engine (No Network)", elapsed, offline.confidence)
                    } else {
                        ModelResponse("No internet connection detected. Please connect to Wi-Fi/data for Gemini AI.", "⚡ Offline Engine", elapsed, 0.2)
                    }
                }
            }

            ExecutionMode.HYBRID -> {
                // First attempt fast offline processing
                val offline = offlineRouter.processQuery(query)
                if (offline.isHandled && offline.confidence >= 0.85) {
                    val elapsed = System.currentTimeMillis() - start
                    return@withContext ModelResponse(offline.response, "⚡ Offline Engine", elapsed, offline.confidence)
                }

                // If not handled or low confidence, check network & cloud
                if (isNetworkAvailable()) {
                    try {
                        val cloudReply = requestCloudGemini(query, apiKey)
                        val elapsed = System.currentTimeMillis() - start
                        ModelResponse(cloudReply, "☁️ Gemini 3.8 Flash", elapsed, 0.98)
                    } catch (e: Exception) {
                        val elapsed = System.currentTimeMillis() - start
                        if (offline.response.isNotEmpty()) {
                            ModelResponse(offline.response, "⚡ Offline Fallback", elapsed, offline.confidence)
                        } else {
                            ModelResponse("Could not reach cloud AI: ${e.message}. Offline answer unavailable.", "⚡ Offline Engine", elapsed, 0.0)
                        }
                    }
                } else {
                    val elapsed = System.currentTimeMillis() - start
                    if (offline.response.isNotEmpty()) {
                        ModelResponse(offline.response, "⚡ Offline Engine", elapsed, offline.confidence)
                    } else {
                        ModelResponse(
                            "Offline: This question requires deep AI reasoning. Connect to the internet for Gemini AI, or ask for math, time, notes, emergency tips, or unit conversions.",
                            "⚡ Offline Engine",
                            elapsed,
                            0.3
                        )
                    }
                }
            }
        }
    }

    private fun requestCloudGemini(prompt: String, apiKey: String?): String {
        val json = JSONObject().apply {
            put("prompt", prompt)
        }
        val mediaType = "application/json; charset=utf-8".toMediaType()
        val requestBody = json.toString().toRequestBody(mediaType)

        val request = Request.Builder()
            .url(cloudApiEndpoint)
            .post(requestBody)
            .addHeader("User-Agent", "aistudio-build")
            .apply {
                if (!apiKey.isNullOrEmpty()) {
                    addHeader("Authorization", "Bearer $apiKey")
                }
            }
            .build()

        httpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw Exception("HTTP ${response.code}: ${response.message}")
            }
            val bodyStr = response.body?.string() ?: throw Exception("Empty response body")
            val respJson = JSONObject(bodyStr)
            return respJson.optString("reply", respJson.optString("response", "No response from AI"))
        }
    }
}
