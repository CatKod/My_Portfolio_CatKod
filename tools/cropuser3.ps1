Add-Type -AssemblyName System.Drawing

$src = 'C:\Users\kimvi\.cursor\projects\d-GitHub-My-Portfolio-CatKod\assets\c__Users_kimvi_AppData_Roaming_Cursor_User_workspaceStorage_854f6971d3356585d10defa7398d6fe0_images_image-e819aa44-6ef4-4e85-b2aa-1707d5202935.png'
$out = 'D:\GitHub\My_Portfolio_CatKod\shots\gemini'

$img = [System.Drawing.Image]::FromFile($src)

function Crop-Scale($name, $x, $y, $w, $h, $scale) {
  $bmp = New-Object System.Drawing.Bitmap(($w * $scale), ($h * $scale))
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($script:img,
    (New-Object System.Drawing.Rectangle(0, 0, ($w * $scale), ($h * $scale))),
    (New-Object System.Drawing.Rectangle($x, $y, $w, $h)),
    [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $path = Join-Path $out ($name + '.png')
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output ("-> " + $name)
}

# Hang the skill bi chong chu (giua man hinh, khoang y=195..330)
Crop-Scale 'user-skills-row' 0 190 1024 145 2
# 2 the skill dau
Crop-Scale 'user-skill-1' 40 200 300 125 3
Crop-Scale 'user-skill-2' 300 200 300 125 3
# Cot ben phai (project cards)
Crop-Scale 'user-projects' 740 200 284 300 3
# Hero
Crop-Scale 'user-hero' 0 0 1024 190 2

$img.Dispose()
