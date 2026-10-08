package com.aura.ai

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.aura.ai.databinding.ActivityMainBinding
import com.google.android.material.chip.Chip
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch
import java.util.Locale

class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    data class Message(
        val text: String,
        val isUser: Boolean,
        val timestamp: Long = System.currentTimeMillis(),
        val source: String? = null,
        val latencyMs: Long? = null
    )

    private lateinit var binding: ActivityMainBinding
    private lateinit var modelManager: ModelManager
    private var textToSpeech: TextToSpeech? = null
    private var speechRecognizer: SpeechRecognizer? = null
    private var isTtsEnabled = true

    private val messages = mutableListOf<Message>()
    private lateinit var chatAdapter: ChatAdapter

    private val voicePermLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            startVoiceListening()
        } else {
            Toast.makeText(this, "Microphone permission required for voice", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        modelManager = ModelManager(this)
        textToSpeech = TextToSpeech(this, this)

        setupRecyclerView()
        setupListeners()
        setupQuickChips()

        // Welcome message
        addMessage(
            Message(
                text = "Salam & Welcome! Main Aura AI hoon. Main offline router ke zariye instant calculations aur hybrid intelligence provide karta hoon.",
                isUser = false,
                source = "⚡ Offline Engine",
                latencyMs = 0
            )
        )
    }

    private fun setupRecyclerView() {
        chatAdapter = ChatAdapter(messages) { message ->
            if (!message.isUser && isTtsEnabled) {
                speakText(message.text)
            }
        }
        binding.chatRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@MainActivity).apply {
                stackFromEnd = true
            }
            adapter = chatAdapter
        }
    }

    private fun setupListeners() {
        binding.btnSend.setOnClickListener {
            val query = binding.editQuery.text.toString().trim()
            if (query.isNotEmpty()) {
                submitQuery(query)
            }
        }

        binding.btnMic.setOnClickListener {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                startVoiceListening()
            } else {
                voicePermLauncher.launch(Manifest.permission.RECORD_AUDIO)
            }
        }

        binding.btnCamera.setOnClickListener {
            Toast.makeText(this, "Vision analysis: Select image or capture photo", Toast.LENGTH_SHORT).show()
        }

        binding.chipMode.setOnClickListener {
            showModeSelectionDialog()
        }
    }

    private fun showModeSelectionDialog() {
        val modes = arrayOf("Hybrid (Auto Router)", "Offline Only (0 Data)", "Gemini Cloud (Full AI)")
        val currentIdx = when (modelManager.currentMode) {
            ModelManager.ExecutionMode.HYBRID -> 0
            ModelManager.ExecutionMode.OFFLINE_ONLY -> 1
            ModelManager.ExecutionMode.CLOUD_PREFER -> 2
        }

        MaterialAlertDialogBuilder(this)
            .setTitle("Select Aura Execution Mode")
            .setSingleChoiceItems(modes, currentIdx) { dialog, which ->
                modelManager.currentMode = when (which) {
                    0 -> ModelManager.ExecutionMode.HYBRID
                    1 -> ModelManager.ExecutionMode.OFFLINE_ONLY
                    else -> ModelManager.ExecutionMode.CLOUD_PREFER
                }
                binding.chipMode.text = when (which) {
                    0 -> "Hybrid"
                    1 -> "Offline"
                    else -> "Cloud"
                }
                binding.statusSubtitle.text = when (which) {
                    0 -> "Offline Engine + Cloud Router • Ready"
                    1 -> "Strict Offline Mode • 0 Data Usage"
                    else -> "Gemini 3.8 Flash Cloud Engine"
                }
                dialog.dismiss()
            }
            .show()
    }

    private fun setupQuickChips() {
        val quickPrompts = listOf(
            "🧮 24 * 35 + 160",
            "🕒 Date & Time",
            "🚨 CPR Steps",
            "📏 25 km to miles",
            "📝 Note: Urgent task",
            "📋 Show Notes",
            "✨ What is Quantum AI?"
        )

        for (prompt in quickPrompts) {
            val chip = Chip(this).apply {
                text = prompt
                isClickable = true
                setChipBackgroundColorResource(R.color.aura_surface_dark)
                setTextColor(ContextCompat.getColor(this@MainActivity, R.color.white))
                setOnClickListener {
                    binding.editQuery.setText(prompt.replace(Regex("^[^\sa-zA-Z0-9]+"), "").trim())
                    submitQuery(binding.editQuery.text.toString())
                }
            }
            binding.quickChipsLayout.addView(chip)
        }
    }

    private fun submitQuery(query: String) {
        addMessage(Message(text = query, isUser = true))
        binding.editQuery.text.clear()

        lifecycleScope.launch {
            val response = modelManager.executeQuery(query)
            addMessage(
                Message(
                    text = response.text,
                    isUser = false,
                    source = response.source,
                    latencyMs = response.latencyMs
                )
            )

            if (isTtsEnabled) {
                speakText(response.text)
            }
        }
    }

    private fun addMessage(message: Message) {
        messages.add(message)
        chatAdapter.notifyItemInserted(messages.size - 1)
        binding.chatRecyclerView.scrollToPosition(messages.size - 1)
    }

    private fun startVoiceListening() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            Toast.makeText(this, "Speech recognition not available on device", Toast.LENGTH_SHORT).show()
            return
        }

        speechRecognizer?.destroy()
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    binding.statusSubtitle.text = "🎙️ Listening to voice..."
                }
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {
                    binding.statusSubtitle.text = "Processing speech..."
                }
                override fun onError(error: Int) {
                    binding.statusSubtitle.text = "Offline Engine • Ready"
                }
                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        binding.editQuery.setText(matches[0])
                        submitQuery(matches[0])
                    }
                    binding.statusSubtitle.text = "Offline Engine • Ready"
                }
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
        }
        speechRecognizer?.startListening(intent)
    }

    private fun speakText(text: String) {
        val clean = text.replace(Regex("[^a-zA-Z0-9.,?!\\s]"), "")
        textToSpeech?.speak(clean, TextToSpeech.QUEUE_FLUSH, null, "aura_msg")
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            textToSpeech?.language = Locale.US
        }
    }

    override fun onDestroy() {
        textToSpeech?.stop()
        textToSpeech?.shutdown()
        speechRecognizer?.destroy()
        super.onDestroy()
    }

    class ChatAdapter(
        private val list: List<Message>,
        private val onSpeakClick: (Message) -> Unit
    ) : RecyclerView.Adapter<ChatAdapter.ViewHolder>() {

        class ViewHolder(v: View) : RecyclerView.ViewHolder(v) {
            val tvText: TextView = v.findViewById(android.R.id.text1)
            val tvMeta: TextView = v.findViewById(android.R.id.text2)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(android.R.layout.simple_list_item_2, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = list[position]
            holder.tvText.text = item.text
            holder.tvText.setTextColor(if (item.isUser) 0xFF38BDF8.toInt() else 0xFFFFFFFF.toInt())

            val meta = if (item.isUser) {
                "You"
            } else {
                "${item.source ?: "Aura AI"} • ${item.latencyMs ?: 0}ms"
            }
            holder.tvMeta.text = meta
            holder.tvMeta.setTextColor(0xFF94A3B8.toInt())

            holder.itemView.setOnClickListener {
                onSpeakClick(item)
            }
        }

        override fun getItemCount() = list.size
    }
}
