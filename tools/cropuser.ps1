Add-Type -AssemblyName System.Drawing

$src = 'C:\Users\kimvi\.cursor\projects\d-GitHub-My-Portfolio-CatKod\assets\c__Users_kimvi_AppData_Roaming_Cursor_User_workspaceStorage_854f6971d3356585d10defa7398d6fe0_images_image-e819aa44-6ef4-4e85-b2aa-1707d5202935.png'
$out = 'D:\GitHub\My_Portfolio_CatKod\shots\gemini'

$img = [System.Drawing.Image]::FromFile($src)
Write-Output ("goc: " + $img.Width + "x" + $img.Height)

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
  Write-Output ("-> " + $path)
}

Crop-Scale 'user-left-top' 0 0 560 300 2
Crop-Scale 'user-right-top' 480 0 544 300 2
Crop-Scale 'user-right-mid' 480 170 544 300 2
Crop-Scale 'user-right-bot' 480 290 544 285 2

# Ban phong to 2x toan anh
Crop-Scale 'user-full-2x' 0 0 $img.Width $img.Height 2

$img.Dispose()
