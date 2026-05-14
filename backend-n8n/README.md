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

## Estructura del repositorio

```txt
frontend/
backend-n8n/
docs/
.env.example
README.md
