# Script to update imports
$files = Get-ChildItem -Path "apps/web" -Recurse -Include *.ts,*.tsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Update component imports
    $content = $content -replace 'from "@/components/', 'from "@docuverse/ui/'
    $content = $content -replace "from '@/components/", "from '@docuverse/ui/"
    
    # Update lib/db and lib/schema imports
    $content = $content -replace 'from "@/lib/db"', 'from "@docuverse/database"'
    $content = $content -replace "from '@/lib/db'", "from '@docuverse/database'"
    $content = $content -replace 'from "@/lib/schema"', 'from "@docuverse/database"'
    $content = $content -replace "from '@/lib/schema'", "from '@docuverse/database'"
    
    # Keep other @/lib imports as is (permissions, auth, utils)
    
    Set-Content $file.FullName -Value $content -NoNewline
}

Write-Host "Imports updated successfully!"
