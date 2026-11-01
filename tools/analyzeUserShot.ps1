Add-Type -AssemblyName System.Drawing

$src = 'C:\Users\kimvi\.cursor\projects\d-GitHub-My-Portfolio-CatKod\assets\c__Users_kimvi_AppData_Roaming_Cursor_User_workspaceStorage_854f6971d3356585d10defa7398d6fe0_images_image-e819aa44-6ef4-4e85-b2aa-1707d5202935.png'
$img = New-Object System.Drawing.Bitmap($src)
$w = $img.Width; $h = $img.Height
Write-Output ("anh: " + $w + "x" + $h + "  ti le: " + [math]::Round($w / $h, 4))

# 1) Tim cot pixel sang toi (khung portfolio) o phia trai
Write-Output "`n--- duong vien khung o ben trai (cot sang nhat tu y=100 den 500) ---"
for ($x = 0; $x -lt 60; $x++) {
  $dark = 0
  for ($y = 100; $y -lt 500; $y += 2) {
    $c = $img.GetPixel($x, $y)
    if (($c.R + $c.G + $c.B) / 3 -lt 200) { $dark++ }
  }
  if ($dark -gt 60) { Write-Output ("  x=" + $x + "  so pixel toi=" + $dark) }
}

# 2) Tim dong pixel sang toi o tren
Write-Output "`n--- duong vien khung o tren (dong sang nhat tu x=100 den 900) ---"
for ($y = 0; $y -lt 60; $y++) {
  $dark = 0
  for ($x = 100; $x -lt 900; $x += 2) {
    $c = $img.GetPixel($x, $y)
    if (($c.R + $c.G + $c.B) / 3 -lt 200) { $dark++ }
  }
  if ($dark -gt 80) { Write-Output ("  y=" + $y + "  so pixel toi=" + $dark) }
}

# 3) Tim cot bang mau dam nhat trong vung hero (chu lon) de do font-size
Write-Output "`n--- tim chu lon: do khoang cach doc giua cac dong chu dam trong hero ---"
$rows = @()
for ($y = 0; $y -lt 200; $y++) {
  $dark = 0
  for ($x = 40; $x -lt 700; $x++) {
    $c = $img.GetPixel($x, $y)
    if (($c.R + $c.G + $c.B) / 3 -lt 90) { $dark++ }
  }
  if ($dark -gt 0) { $rows += ,@($y, $dark) }
}
$prev = -10
foreach ($r in $rows) {
  if ($r[0] - $prev -gt 1) { Write-Output ("  dong chu bat dau y=" + $r[0]) }
  $prev = $r[0]
}

$img.Dispose()
