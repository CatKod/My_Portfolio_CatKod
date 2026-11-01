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
  Write-Output ("-> " + $name + "  (" + $w + "x" + $h + " @ " + $scale + "x)")
}

# Cot chung chi ben phai
Crop-Scale 'user-cert-column' 740 210 284 365 3
# Vung tieu de chung chi ( noi text bi mat)
Crop-Scale 'user-cert-titles' 740 210 284 140 4
# Toan boi board
Crop-Scale 'user-board' 600 190 424 385 2

$img.Dispose()
