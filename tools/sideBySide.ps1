Add-Type -AssemblyName System.Drawing

$userImg = 'C:\Users\kimvi\.cursor\projects\d-GitHub-My-Portfolio-CatKod\assets\c__Users_kimvi_AppData_Roaming_Cursor_User_workspaceStorage_854f6971d3356585d10defa7398d6fe0_images_image-e819aa44-6ef4-4e85-b2aa-1707d5202935.png'
$mineImg = 'D:\GitHub\My_Portfolio_CatKod\shots\gemini\best-1024x575.png'
$out = 'D:\GitHub\My_Portfolio_CatKod\shots\gemini'

$a = New-Object System.Drawing.Bitmap($userImg)
$b = New-Object System.Drawing.Bitmap($mineImg)

# Ghep canh nhau: user | mine, khu vuc trung tam 200..800 x 140..340
$x = 200; $y = 140; $w = 600; $h = 200; $scale = 2
$gap = 20

$canvas = New-Object System.Drawing.Bitmap((($w * 2 * $scale) + $gap), ($h * $scale))
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.Clear([System.Drawing.Color]::White)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($a, (New-Object System.Drawing.Rectangle(0, 0, ($w * $scale), ($h * $scale))),
  (New-Object System.Drawing.Rectangle($x, $y, $w, $h)), [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawImage($b, (New-Object System.Drawing.Rectangle((($w * $scale) + $gap), 0, ($w * $scale), ($h * $scale))),
  (New-Object System.Drawing.Rectangle($x, $y, $w, $h)), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$canvas.Save((Join-Path $out 'side-by-side.png'), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "-> side-by-side.png (trai = user, phai = render 1024x575)"
$canvas.Dispose()

# Crop rieng phan capability cua user, phong to 4x
function Crop-Scale($name, $img, $x, $y, $w, $h, $scale) {
  $bmp = New-Object System.Drawing.Bitmap(($w * $scale), ($h * $scale))
  $gg = [System.Drawing.Graphics]::FromImage($bmp)
  $gg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gg.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, ($w * $scale), ($h * $scale))),
    (New-Object System.Drawing.Rectangle($x, $y, $w, $h)), [System.Drawing.GraphicsUnit]::Pixel)
  $gg.Dispose()
  $bmp.Save((Join-Path $out ($name + '.png')), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output ("-> " + $name)
}

Crop-Scale 'cmp-user-mid' $a 200 140 600 200 3
Crop-Scale 'cmp-mine-mid' $b 200 140 600 200 3

$a.Dispose(); $b.Dispose()
