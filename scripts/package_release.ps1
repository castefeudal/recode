$ErrorActionPreference = 'Stop'
$version = (Get-Content VERSION -Raw).Trim()
$out = 'dist/packages'
New-Item -ItemType Directory -Force $out | Out-Null

Write-Host 'Windows helper creates source-oriented kits. The canonical verified release is produced by scripts/package_release.sh.'
python tools/validators/validate_project.py
python tools/validators/validate_campaign.py tools/creator_studio/example_campaign.mmc

$sourceItems = @('game','backend','tools','native_plugins','docs','store','steamworks','scripts','landing','legal','art_source','art_prompts','web_app','README.md','RUN_ME_FIRST.md','PROJECT_STATUS.md','DELIVERY_MANIFEST.md','CHANGELOG.md','PRODUCT_TRUTH_AUDIT.md','TEST_REPORT.md','ASSET_LICENSES.md','THIRD_PARTY_NOTICES.md','LICENSE','VERSION')
$creatorItems = @('game/narrative','game/data','tools/content','tools/creator_studio','tools/validators','docs/NARRATIVE_BIBLE.md','docs/CHARACTER_BIBLE.md','docs/GDD.md','docs/CONTENT_PIPELINE.md','docs/CREATOR_STUDIO.md')
$platformItems = @('game','backend','native_plugins','scripts','store','steamworks','legal','.github','.env.example','README.md','RUN_ME_FIRST.md','PROJECT_STATUS.md','DELIVERY_MANIFEST.md','ASSET_LICENSES.md','THIRD_PARTY_NOTICES.md','LICENSE','VERSION')
$documentationItems = @('docs','legal','README.md','RUN_ME_FIRST.md','PROJECT_STATUS.md','DELIVERY_MANIFEST.md','CHANGELOG.md','PRODUCT_TRUTH_AUDIT.md','TEST_REPORT.md','ASSET_LICENSES.md','THIRD_PARTY_NOTICES.md','LICENSE','VERSION')

Compress-Archive -Path $sourceItems -DestinationPath "$out/MARKOVMADE_RECODE_${version}_SOURCE_WINDOWS.zip" -Force
Compress-Archive -Path $creatorItems -DestinationPath "$out/MARKOVMADE_RECODE_${version}_CONTENT_CREATOR_KIT_WINDOWS.zip" -Force
Compress-Archive -Path $platformItems -DestinationPath "$out/MARKOVMADE_RECODE_${version}_PLATFORM_RELEASE_KIT_WINDOWS.zip" -Force
Compress-Archive -Path $documentationItems -DestinationPath "$out/MARKOVMADE_RECODE_${version}_DOCUMENTATION_WINDOWS.zip" -Force
Get-FileHash "$out/*_WINDOWS.zip" -Algorithm SHA256 | Format-Table -AutoSize

Write-Host 'Remove web_app/node_modules and web_app/dist from the Windows source helper before distribution, or use the canonical Linux packager which excludes them automatically.'
