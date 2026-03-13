// cek-model.mjs
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "ISI_API_KEY_ANDA_DI_SINI"; // Masukkan key Anda langsung di sini untuk tes
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("Error dari Google:", data.error.message);
      return;
    }

    console.log("DAFTAR MODEL YANG BISA ANDA PAKAI:");
    data.models.forEach(m => {
      console.log(`- ID: ${m.name.replace('models/', '')} | Method: ${m.supportedGenerationMethods}`);
    });
  } catch (e) {
    console.error("Gagal koneksi:", e);
  }
}

listModels();