Add-Type -AssemblyName System.Drawing

$src = 'D:\GitHub\My_Portfolio_CatKod\shots\gemini\FINAL-1536x864.png'
$out = 'D:\GitHub\My_Portfolio_CatKod\shots\gemini'
$img = [System.Drawing.Bitmap]::FromFile($src)
Write-Output ("FINAL anh: " + $img.Width + "x" + $img.Height)

function Crop-Scale($name, $x, $y, $w, $h, $scale) {
  $bmp = New-Object System.Drawing.Bitmap(($w * $scale), ($h * $scale))
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($script:img, (New-Object System.Drawing.Rectangle(0, 0, ($w * $scale), ($h * $scale))),
    (New-Object System.Drawing.Rectangle($x, $y, $w, $h)), [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $bmp.Save((Join-Path $out ($name + '.png')), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output ("-> " + $name)
}

# Vung 4 the capability (do duoc: grid x=602 y=583 w=872 h=175)
Crop-Scale 'zoom-cards-final' 595 575 890 190 2
# Vung intro + system giao nhau
Crop-Scale 'zoom-intro-final' 235 440 1000 200 2

$img.Dispose()
