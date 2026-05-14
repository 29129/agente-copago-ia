# Estimador Agéntico de Copago y Cobertura para el Paciente

MVP desarrollado para hackathon de inteligencia artificial.

## Descripción

Este proyecto implementa un agente conversacional capaz de recibir síntomas del paciente, analizar la especialidad médica sugerida, calcular un copago estimado según el plan de seguro y recomendar el hospital más conveniente económicamente.

## Arquitectura

Frontend Web  
↓  
Webhook público de n8n  
↓  
OpenAI API  
↓  
Lógica simulada de cobertura y copago  
↓  
Respuesta JSON al frontend  

### CORS (Vercel → Railway)

El navegador bloquea llamadas directas entre orígenes distintos si n8n no envía cabeceras CORS en el preflight (`OPTIONS`). El front en Vercel usa un **proxy** (`/api/copago`) que reenvía el `POST` al webhook en Railway (misma origen en Vercel, sin CORS en el cliente).

Opcional en Railway (llamadas directas al webhook, p. ej. desde otro dominio): variables de entorno según la documentación de n8n, por ejemplo `N8N_DEFAULT_CORS=true` y `N8N_CORS_ALLOW_ORIGIN` con la URL exacta del front (o el valor que indique la versión de n8n que uses).

## Estructura del repositorio

```txt
frontend/
backend-n8n/
docs/
.env.example
README.md
