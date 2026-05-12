const form = document.querySelector("#coverage-form");
const emptyState = document.querySelector("#empty-state");
const resultCard = document.querySelector("#result-card");

const specialty = document.querySelector("#specialty");
const reason = document.querySelector("#reason");
const copay = document.querySelector("#copay");
const coverage = document.querySelector("#coverage");
const hospital = document.querySelector("#hospital");
const hospitalNote = document.querySelector("#hospital-note");

const mockPlans = {
  basico: { coverage: 65, baseCopay: 28, hospital: "Hospital Municipal" },
  plus: { coverage: 80, baseCopay: 18, hospital: "Clinica Central" },
  premium: { coverage: 90, baseCopay: 10, hospital: "Hospital Metropolitano" },
};

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

function estimateSpecialty(symptoms) {
  const normalizedSymptoms = symptoms.toLowerCase();
  return (
    specialties.find((specialtyItem) =>
      specialtyItem.keywords.some((keyword) => normalizedSymptoms.includes(keyword))
    ) || specialties[0]
  );
}

function calculateEstimate(formData) {
  const selectedPlan = mockPlans[formData.get("insurancePlan")];
  const selectedSpecialty = estimateSpecialty(formData.get("symptoms"));
  const preference = formData.get("preference");
  const city = formData.get("city");

  const adjustment = selectedSpecialty.name === "Cardiologia" ? 12 : 0;
  const estimatedCopay = selectedPlan.baseCopay + adjustment;

  return {
    specialty: selectedSpecialty.name,
    reason: selectedSpecialty.reason,
    copay: `$${estimatedCopay}`,
    coverage: `${selectedPlan.coverage}%`,
    hospital: selectedPlan.hospital,
    hospitalNote: `Recomendado en ${city} por ${
      preference === "economico"
        ? "tener el menor copago estimado para tu plan."
        : preference === "cobertura"
          ? "ofrecer mejor cobertura simulada para esta consulta."
          : "mantener una buena relacion entre acceso y costo."
    }`,
  };
}

function renderResult(result) {
  specialty.textContent = result.specialty;
  reason.textContent = result.reason;
  copay.textContent = result.copay;
  coverage.textContent = result.coverage;
  hospital.textContent = result.hospital;
  hospitalNote.textContent = result.hospitalNote;

  emptyState.classList.add("hidden");
  resultCard.classList.remove("hidden");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const result = calculateEstimate(formData);
  renderResult(result);
});
