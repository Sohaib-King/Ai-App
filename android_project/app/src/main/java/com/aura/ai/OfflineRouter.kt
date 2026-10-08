package com.aura.ai

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.regex.Pattern

/**
 * OfflineRouter: High-efficiency local routing engine for Aura AI.
 * Handles instant local queries with zero network latency,
 * including math computations, unit conversions, system diagnostics,
 * multilingual greetings, emergency guides, and offline notes.
 */
class OfflineRouter {

    data class RouteResult(
        val isHandled: Boolean,
        val response: String,
        val confidence: Double,
        val intent: String,
        val executionTimeMs: Long
    )

    private val localNotes = mutableListOf<String>()

    /**
     * Attempts to resolve the query locally using offline patterns and rule sets.
     */
    fun processQuery(query: String): RouteResult {
        val startTime = System.currentTimeMillis()
        val normalized = query.trim().lowercase(Locale.ROOT)

        // 1. Math computation
        val mathResult = evaluateMath(normalized)
        if (mathResult != null) {
            val elapsed = System.currentTimeMillis() - startTime
            return RouteResult(
                isHandled = true,
                response = "🧮 Math Result: $mathResult",
                confidence = 1.0,
                intent = "MATH_CALCULATION",
                executionTimeMs = elapsed
            )
        }

        // 2. Date and Time
        if (normalized.contains("time") || normalized.contains("waqt") || normalized.contains("date") || normalized.contains("tareekh")) {
            val sdf = SimpleDateFormat("EEEE, MMMM d, yyyy • h:mm:ss a", Locale.getDefault())
            val current = sdf.format(Date())
            val elapsed = System.currentTimeMillis() - startTime
            return RouteResult(
                isHandled = true,
                response = "🕒 Current Date & Time: $current",
                confidence = 0.95,
                intent = "DATETIME_CHECK",
                executionTimeMs = elapsed
            )
        }

        // 3. Multilingual Greetings (Urdu / English / Roman Urdu)
        if (matchesGreeting(normalized)) {
            val elapsed = System.currentTimeMillis() - startTime
            val greeting = getGreetingResponse(normalized)
            return RouteResult(
                isHandled = true,
                response = greeting,
                confidence = 0.95,
                intent = "GREETING",
                executionTimeMs = elapsed
            )
        }

        // 4. Offline Notes Management
        if (normalized.startsWith("note:") || normalized.startsWith("save note") || normalized.startsWith("yaad rakhna")) {
            val noteContent = query.substringAfter(":").trim()
            if (noteContent.isNotEmpty()) {
                localNotes.add(noteContent)
                val elapsed = System.currentTimeMillis() - startTime
                return RouteResult(
                    isHandled = true,
                    response = "📝 Note saved in offline memory: \"$noteContent\" (Total notes: ${localNotes.size})",
                    confidence = 0.99,
                    intent = "OFFLINE_NOTE_SAVE",
                    executionTimeMs = elapsed
                )
            }
        }

        if (normalized == "show notes" || normalized == "view notes" || normalized == "notes" || normalized.contains("meray notes")) {
            val elapsed = System.currentTimeMillis() - startTime
            val response = if (localNotes.isEmpty()) {
                "📝 No offline notes saved yet. Type 'Note: [your message]' to save one."
            } else {
                "📋 Saved Offline Notes:\n" + localNotes.mapIndexed { i, n -> "${i + 1}. $n" }.joinToString("\n")
            }
            return RouteResult(
                isHandled = true,
                response = response,
                confidence = 0.99,
                intent = "OFFLINE_NOTES_VIEW",
                executionTimeMs = elapsed
            )
        }

        // 5. Emergency First-Aid Guides
        val emergency = checkEmergencyGuide(normalized)
        if (emergency != null) {
            val elapsed = System.currentTimeMillis() - startTime
            return RouteResult(
                isHandled = true,
                response = emergency,
                confidence = 0.98,
                intent = "EMERGENCY_ASSIST",
                executionTimeMs = elapsed
            )
        }

        // 6. Unit Conversion
        val conversion = checkUnitConversion(normalized)
        if (conversion != null) {
            val elapsed = System.currentTimeMillis() - startTime
            return RouteResult(
                isHandled = true,
                response = conversion,
                confidence = 0.92,
                intent = "UNIT_CONVERT",
                executionTimeMs = elapsed
            )
        }

        // 7. Identity & Core Capability Info
        if (normalized.contains("who are you") || normalized.contains("aap kon ho") || normalized.contains("tum kon ho") || normalized == "aura") {
            val elapsed = System.currentTimeMillis() - startTime
            return RouteResult(
                isHandled = true,
                response = "✨ Aura AI: Main aapka smart mobile AI assistant hoon. Main offline router ke zariye instant answers provide karta hoon, aur complex tasks ke liye Gemini Cloud AI engine se connect hota hoon.",
                confidence = 0.95,
                intent = "IDENTITY",
                executionTimeMs = elapsed
            )
        }

        // Query not confident enough for local handling -> route to ModelManager (cloud/on-device SLM)
        val elapsed = System.currentTimeMillis() - startTime
        return RouteResult(
            isHandled = false,
            response = "",
            confidence = 0.2,
            intent = "DELEGATE_TO_CLOUD",
            executionTimeMs = elapsed
        )
    }

    private fun matchesGreeting(text: String): Boolean {
        val keywords = listOf(
            "salam", "assalam", "hello", "hi aura", "hey aura",
            "kya haal hai", "kaisay ho", "how are you", "adaab", "namaste"
        )
        return keywords.any { text.contains(it) }
    }

    private fun getGreetingResponse(text: String): String {
        return when {
            text.contains("salam") || text.contains("assalam") ->
                "Walaikum Assalam! Main Aura AI hoon. Main aapki kya madad kar sakta hoon?"
            text.contains("kya haal") || text.contains("kaisay ho") || text.contains("how are you") ->
                "Main theek hoon, shukriya! Aura AI offline & hybrid ready hai. Aap koi sawaal poochein ya calculation karein."
            else ->
                "Hello! Aura AI is ready. You can ask questions, run offline math, or speak via microphone."
        }
    }

    private fun evaluateMath(text: String): String? {
        val pattern = Pattern.compile("(-?\\d+(\\.\\d+)?)\\s*([+\\-*/%^])\\s*(-?\\d+(\\.\\d+)?)")
        val matcher = pattern.matcher(text)
        if (matcher.find()) {
            val num1 = matcher.group(1)?.toDoubleOrNull() ?: return null
            val op = matcher.group(3) ?: return null
            val num2 = matcher.group(4)?.toDoubleOrNull() ?: return null

            val res = when (op) {
                "+" -> num1 + num2
                "-" -> num1 - num2
                "*" -> num1 * num2
                "/" -> if (num2 != 0.0) num1 / num2 else return "Cannot divide by zero"
                "%" -> num1 % num2
                "^" -> Math.pow(num1, num2)
                else -> return null
            }
            return "$num1 $op $num2 = $res"
        }
        return null
    }

    private fun checkEmergencyGuide(text: String): String? {
        return when {
            text.contains("cpr") ->
                "🚨 CPR Emergency Guide:\n1. Check responsiveness and call local emergency services.\n2. Push hard and fast in the center of the chest (100–120 bpm).\n3. Allow chest to fully recoil between compressions."
            text.contains("burn") || text.contains("jal gaya") ->
                "🚨 Burn First Aid:\n1. Cool the burn under cool running water for at least 10–20 minutes.\n2. Do NOT apply ice or butter.\n3. Cover loosely with sterile plastic cling film or clean bandage."
            text.contains("bleeding") || text.contains("khoon") ->
                "🚨 Bleeding First Aid:\n1. Apply firm, direct pressure with a clean cloth.\n2. Elevate the injured area if possible.\n3. Keep constant pressure until professional medical assistance arrives."
            else -> null
        }
    }

    private fun checkUnitConversion(text: String): String? {
        val kmMatcher = Pattern.compile("(\\d+(\\.\\d+)?)\\s*km").matcher(text)
        if (kmMatcher.find()) {
            val km = kmMatcher.group(1).toDouble()
            val miles = km * 0.621371
            return "📏 $km km ≈ %.2f miles".format(miles)
        }
        val kgMatcher = Pattern.compile("(\\d+(\\.\\d+)?)\\s*kg").matcher(text)
        if (kgMatcher.find()) {
            val kg = kgMatcher.group(1).toDouble()
            val lbs = kg * 2.20462
            return "⚖️ $kg kg ≈ %.2f lbs (pounds)".format(lbs)
        }
        return null
    }
}
