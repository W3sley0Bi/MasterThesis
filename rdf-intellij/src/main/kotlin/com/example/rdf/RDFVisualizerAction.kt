package com.example.rdf

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.wm.ToolWindowAnchor
import com.intellij.openapi.wm.ToolWindowManager
import com.intellij.ui.content.ContentFactory
import com.intellij.ui.jcef.JBCefBrowser
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.awt.BorderLayout
import javax.swing.JPanel

@Serializable
data class ServerResponse(val content: String, val rdfData: String)

class RDFVisualizerAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val virtualFile = e.getData(CommonDataKeys.VIRTUAL_FILE) ?: return

        val filePath = virtualFile.path
        val file = java.io.File(filePath)

        val mediaType = "application/x-turtle".toMediaTypeOrNull()
            ?: "application/octet-stream".toMediaTypeOrNull()

        val requestBody = file.asRequestBody(mediaType)

        val formData = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("fileUpload", file.name, requestBody)
            .build()

        val request = Request.Builder()
            .url("http://localhost:8000/")
            .post(formData)
            .build()

        val client = OkHttpClient()

        try {
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val jsonResponse = response.body?.string() ?: throw Exception("Empty response body")
                val responseBody: ServerResponse = Json.decodeFromString(jsonResponse)

                showGraphViewer(project, responseBody.content)
            } else {
                val errorBody = response.body?.string()
                println("Error in request: ${response.code} - $errorBody")
                Messages.showErrorDialog("Request error: ${response.code}", "Error")
            }

            response.close()

        } catch (ex: Exception) {
            Messages.showErrorDialog(
                "Connection error: ${ex.message}",
                "Error"
            )
        }
    }

    private fun showGraphViewer(project: Project, rawHtml: String) {
        val toolWindowManager = ToolWindowManager.getInstance(project)
        var toolWindow = toolWindowManager.getToolWindow("RDF Visualizer")

        if (toolWindow == null) {
            toolWindow = toolWindowManager.registerToolWindow(
                "RDF Visualizer",
                true,
                ToolWindowAnchor.RIGHT
            )
        }

        val processedHtml = preprocessHtml(rawHtml)

        val browser = JBCefBrowser()
        browser.loadHTML(processedHtml)
        println("Processed HTML:\n$processedHtml")


        // Open DevTools for debugging
        browser.openDevtools()

        val panel = JPanel(BorderLayout())
        panel.add(browser.component, BorderLayout.CENTER)

        val content = ContentFactory.getInstance().createContent(panel, "", false)
        toolWindow.contentManager.removeAllContents(true)
        toolWindow.contentManager.addContent(content)
        toolWindow.show()
    }


    private fun preprocessHtml(rawHtml: String): String {
        val serviceEndpoint = "http://localhost:8000"

        // Replace script URLs with absolute backend URLs
        var modifiedHtml = rawHtml.replace(
            Regex("""<script\s+src=["'](\/?visualizer\/visualizer\.js)["']\s*>""", RegexOption.IGNORE_CASE),
            """<script src="$serviceEndpoint/visualizer/visualizer.js">"""
        ).replace(
            Regex("""<script\s+src=["'](\/?uploader\/uploader\.js)["']\s*>""", RegexOption.IGNORE_CASE),
            """<script src="$serviceEndpoint/uploader/uploader.js">"""
        )

        modifiedHtml = modifiedHtml.replace(
            Regex("""<[^>]*id=["']uploader["'][^>]*>.*?</[^>]+>""", RegexOption.DOT_MATCHES_ALL),
            ""
        )


        // Inject a Content Security Policy (CSP)
        val csp = """
        <meta http-equiv="Content-Security-Policy" content="script-src * 'unsafe-inline' 'unsafe-eval';">
        """.trimIndent()

        // Insert the CSP into the <head> section
        modifiedHtml = modifiedHtml.replaceFirst("<head>", "<head>$csp")

        return modifiedHtml
    }
}
