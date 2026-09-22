$ErrorActionPreference = "Stop"

npx --yes deno test --allow-env --allow-read nizam/nizam_test.ts
if ($LASTEXITCODE -ne 0) { throw "Digital Nizam tests failed; deployment stopped." }

$stageRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("digital-nizam-deploy-" + [guid]::NewGuid().ToString("N"))
$functionRoot = Join-Path $stageRoot "supabase\functions\nizam"
try {
  New-Item -ItemType Directory -Path $functionRoot -Force | Out-Null
  Copy-Item -Path "nizam\*" -Destination $functionRoot -Recurse -Force
  supabase functions deploy nizam --project-ref jmyqvrvrguhfujgombqe --use-api --no-verify-jwt --workdir $stageRoot
} finally {
  if (Test-Path -LiteralPath $stageRoot) {
    Remove-Item -LiteralPath $stageRoot -Recurse -Force
  }
}
