const form = document.querySelector("#coverage-form");
const emptyState = document.querySelector("#empty-state");
const resultCard = document.querySelector("#result-card");
const submitButton = form.querySelector(".primary-button");

const specialty = document.querySelector("#specialty");
const reason = document.querySelector("#reason");
const copay = document.querySelector("#copay");
const coverage = document.querySelector("#coverage");
const hospital = document.querySelector("#hospital");
const hospitalNote = document.querySelector("#hospital-note");
const agentAnswer = document.querySelector("#agent-answer");
const hospitalOptions = document.querySelector("#hospital-options");

const DEFAULT_N8N_WEBHOOK_URL =
  "https://agente-copago-ia-production.up.railway.app/webhook/agente-copago";

const mockPlans = {
  basico: { coverageBoost: 0, copayDiscount: 0 },
  plus: { coverageBoost: 10, copayDiscount: 8 },
  premium: { coverageBoost: 18, copayDiscount: 16 },
};

const hospitalNetwork = [
  {
    name: "Hospital Municipal",
    baseCoverage: 65,
    baseCopay: 32,
    cities: ["quito", "guayaquil"],
    proximityRank: { quito: 1, guayaquil: 3 },
  },
  {
    name: "Clinica Central",
    baseCoverage: 72,
    baseCopay: 30,
    cities: ["guayaquil", "cuenca"],
    proximityRank: { guayaquil: 1, cuenca: 2 },
  },
  {
    name: "Hospital Metropolitano",
    baseCoverage: 78,
    baseCopay: 36,
    cities: ["quito", "guayaquil", "cuenca"],
    proximityRank: { quito: 2, guayaquil: 2, cuenca: 1 },
  },
];

const specialties = [
  {
    keywords: ["garganta", "fiebre", "tos", "congestion", "resfriado", "dolor de cabeza"],
    name: "Medicina general",
    reason: "Los sintomas sugieren una evaluacion inicial para orientar tratamiento o derivacion.",
  },
  {
    keywords: ["pecho", "palpitaciones", "presion", "corazon"],
    name: "Cardiologia",
    reason: "Los sintomas reportados requieren valoracion cardiovascular prioritaria.",
  },
  {
    keywords: ["piel", "mancha", "roncha", "alergia", "picazon"],
    name: "Dermatologia",
    reason: "La consulta se relaciona con molestias visibles o irritacion en piel.",
  },
  {
    keywords: ["estomago", "nausea", "diarrea", "abdomen", "gastritis"],
    name: "Gastroenterologia",
    reason: "Los sintomas apuntan a una evaluacion digestiva especializada.",
  },
];

function getN8nWebhookUrl() {
  const fromWindow =
    typeof window !== "undefined" && window.__COPAGO_WEBHOOK_URL__ != null
      ? String(window.__COPAGO_WEBHOOK_URL__).trim()
      : "";
  if (fromWindow) {
    return fromWindow;
  }

  try {
    const raw = new URLSearchParams(window.location.search).get("webhook");
    if (raw) {
      return decodeURIComponent(raw.trim());
    }
  } catch {
    /* ignore malformed query */
  }

  return DEFAULT_N8N_WEBHOOK_URL;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCoverageCell(value) {
  if (value == null || value === "") {
    return "—";
  }
  const s = String(value).trim();
  if (/%/.test(s)) {
    return s;
  }
  const n = Number(s);
  return Number.isFinite(n) ? `${n}%` : s;
}

function formatCopayCell(value) {
  if (value == null || value === "") {
    return "—";
  }
  const s = String(value).trim();
  if (s.startsWith("$")) {
    return s;
  }
  const n = Number(s.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? `$${n}` : s;
}

function estimateSpecialty(symptoms) {
  const normalizedSymptoms = symptoms.toLowerCase();
  return (
    specialties.find((specialtyItem) =>
      specialtyItem.keywords.some((keyword) => normalizedSymptoms.includes(keyword))
    ) || specialties[0]
  );
}

function sortHospitalsByPreference(estimates, preference) {
  const copy = [...estimates];

  if (preference === "cobertura") {
    return copy.sort((a, b) => {
      if (b.coverage !== a.coverage) {
        return b.coverage - a.coverage;
      }
      if (a.copay !== b.copay) {
        return a.copay - b.copay;
      }
      return String(a.name).localeCompare(String(b.name));
    });
  }

  if (preference === "cercano") {
    return copy.sort((a, b) => {
      const pa = a.proximityRank ?? 99;
      const pb = b.proximityRank ?? 99;
      if (pa !== pb) {
        return pa - pb;
      }
      if (a.copay !== b.copay) {
        return a.copay - b.copay;
      }
      return b.coverage - a.coverage;
    });
  }

  return copy.sort((a, b) => {
    if (a.copay !== b.copay) {
      return a.copay - b.copay;
    }
    if (b.coverage !== a.coverage) {
      return b.coverage - a.coverage;
    }
    return String(a.name).localeCompare(String(b.name));
  });
}

function buildRequestPayload(formData) {
  return {
    symptoms: formData.get("symptoms").trim(),
    insurancePlan: formData.get("insurancePlan"),
    city: formData.get("city"),
    preference: formData.get("preference"),
  };
}

function calculateEstimate(payload) {
  const selectedPlan = mockPlans[payload.insurancePlan];
  const selectedSpecialty = estimateSpecialty(payload.symptoms);
  const preference = payload.preference;
  const city = payload.city;

  const adjustment = selectedSpecialty.name === "Cardiologia" ? 12 : 0;
  const hospitalEstimates = sortHospitalsByPreference(
    hospitalNetwork
      .filter((hospitalItem) => hospitalItem.cities.includes(city))
      .map((hospitalItem) => ({
        name: hospitalItem.name,
        coverage: Math.min(hospitalItem.baseCoverage + selectedPlan.coverageBoost, 95),
        copay: Math.max(hospitalItem.baseCopay + adjustment - selectedPlan.copayDiscount, 8),
        proximityRank: hospitalItem.proximityRank?.[city] ?? 5,
      })),
    preference
  );

  const bestHospital = hospitalEstimates[0];

  return {
    specialty: selectedSpecialty.name,
    reason: selectedSpecialty.reason,
    copay: `$${bestHospital.copay}`,
    coverage: `${bestHospital.coverage}%`,
    hospital: bestHospital.name,
    hospitalNote: `Recomendado en ${city} por ${
      preference === "economico"
        ? "tener el menor copago estimado entre los hospitales de la red para tu plan."
        : preference === "cobertura"
          ? "priorizar la mayor cobertura simulada entre las opciones disponibles."
          : "priorizar la ubicacion mas cercana simulada, equilibrando costo cuando hay empate."
    }`,
    agentAnswer: `Segun tus sintomas, te sugiero consultar ${selectedSpecialty.name}. Revise los hospitales de la red en ${city} y la opcion mas conveniente es ${bestHospital.name} con un copago estimado de $${bestHospital.copay}.`,
    hospitals: hospitalEstimates,
  };
}

async function requestN8nEstimate(payload) {
  const webhookUrl = getN8nWebhookUrl();
  if (!webhookUrl) {
    return null;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("n8n request failed");
  }

  return response.json();
}

function normalizeResult(result, fallbackResult) {
  return {
    specialty: result.specialty || fallbackResult.specialty,
    reason: result.reason || fallbackResult.reason,
    copay: result.copay || fallbackResult.copay,
    coverage: result.coverage || fallbackResult.coverage,
    hospital: result.hospital || fallbackResult.hospital,
    hospitalNote: result.hospitalNote || fallbackResult.hospitalNote,
    agentAnswer: result.agentAnswer || fallbackResult.agentAnswer,
    hospitals: result.hospitals || result.hospitalOptions || fallbackResult.hospitals,
  };
}

function renderHospitalOptions(hospitals) {
  const list = Array.isArray(hospitals) ? hospitals : [];
  hospitalOptions.innerHTML = list
    .map(
      (hospitalItem, index) => `
        <div class="comparison-row ${index === 0 ? "is-best" : ""}" role="row">
          <strong role="cell">${escapeHtml(hospitalItem.name ?? "")}</strong>
          <span role="cell">${escapeHtml(formatCoverageCell(hospitalItem.coverage))}</span>
          <span role="cell">${escapeHtml(formatCopayCell(hospitalItem.copay))}</span>
        </div>
      `
    )
    .join("");
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.innerHTML = isLoading
    ? 'Consultando agente <span aria-hidden="true">...</span>'
    : 'Estimar cobertura <span aria-hidden="true">&rarr;</span>';
}

function renderResult(result) {
  agentAnswer.textContent = result.agentAnswer;
  specialty.textContent = result.specialty;
  reason.textContent = result.reason;
  copay.textContent = result.copay;
  coverage.textContent = result.coverage;
  hospital.textContent = result.hospital;
  hospitalNote.textContent = result.hospitalNote;
  renderHospitalOptions(result.hospitals);

  emptyState.classList.add("hidden");
  resultCard.classList.remove("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = buildRequestPayload(formData);
  const fallbackResult = calculateEstimate(payload);

  setLoading(true);

  try {
    const n8nResult = await requestN8nEstimate(payload);
    const result = n8nResult ? normalizeResult(n8nResult, fallbackResult) : fallbackResult;
    renderResult(result);
  } catch (error) {
    renderResult({
      ...fallbackResult,
      agentAnswer: `${fallbackResult.agentAnswer} Use una estimacion local porque el agente n8n no respondio en este momento.`,
    });
  } finally {
    setLoading(false);
  }
});
