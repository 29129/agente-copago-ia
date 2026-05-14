# Hackathon - Agente IA Estimador de Copago y Cobertura

MVP con n8n + OpenAI + Railway.

## Endpoint principal

POST `https://TU-DOMINIO-RAILWAY.up.railway.app/webhook/agente-copago`

### Input

```json
{
  "nombre": "Juan",
  "sintoma": "dolor de pecho y mareos",
  "planSeguro": "Premium"
}
```

### Output esperado

```json
{
  "nombre": "Juan",
  "especialidad": "Cardiología",
  "urgencia": "alta",
  "cobertura": "90%",
  "copago": "$20",
  "hospitalRecomendado": "Hospital Central",
  "costoPacienteEstimado": "$28",
  "mensaje": "..."
}
```

## Variables Railway

```env
PORT=5678
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_HOST=TU-DOMINIO-RAILWAY.up.railway.app
WEBHOOK_URL=https://TU-DOMINIO-RAILWAY.up.railway.app/
N8N_ENCRYPTION_KEY=CAMBIA_ESTO_POR_UNA_CLAVE_LARGA
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=CAMBIA_ESTA_PASSWORD
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
GENERIC_TIMEZONE=America/Guayaquil
TZ=America/Guayaquil
```

## Estructura

```txt
/workflows
  agente_principal.json
README.md
railway.json
Dockerfile
```
