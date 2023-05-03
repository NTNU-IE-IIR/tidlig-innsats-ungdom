{{- define "chart.labels" -}}
chart: "{{ .Chart.Name }}-{{ .Chart.Version }}"
{{- end -}}

{{- define "app.name" -}}
{{- printf "%s-%s" .Chart.Name "app" -}}
{{- end -}}

{{- define "app.port" -}}
{{- 3000 -}}
{{- end -}}

{{- define "postgres.name" -}}
{{- printf "%s-%s" .Chart.Name "postgres" -}}
{{- end -}}

{{- define "postgres.port" -}}
{{- 5432 -}}
{{- end -}}

{{- define "postgres.database" -}}
{{- printf "rfftiu" -}}
{{- end -}}
