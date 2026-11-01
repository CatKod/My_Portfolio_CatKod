Add-Type -AssemblyName System.Drawing

$userImg = 'C:\Users\kimvi\.cursor\projects\d-GitHub-My-Portfolio-CatKod\assets\c__Users_kimvi_AppData_Roaming_Cursor_User_workspaceStorage_854f6971d3356585d10defa7398d6fe0_images_image-e819aa44-6ef4-4e85-b2aa-1707d5202935.png'
$mineImg = 'D:\GitHub\My_Portfolio_CatKod\shots\gemini\best-1024x575.png'

$a = New-Object System.Drawing.Bitmap($userImg)
$b = New-Object System.Drawing.Bitmap($mineImg)

# Tim cac vung khac biet lon bang so sanh theo block 32x32
$bw = 32; $bh = 32
$blocks = @()
for ($by = 0; $by -lt $a.Height; $by += $bh) {
  for ($bx = 0; $bx -lt $a.Width; $bx += $bw) {
    $sum = 0; $n = 0
    for ($y = $by; $y -lt [math]::Min($by + $bh, $a.Height); $y += 2) {
      for ($x = $bx; $x -lt [math]::Min($bx + $bw, $a.Width); $x += 2) {
        $pa = $a.GetPixel($x, $y); $pb = $b.GetPixel($x, $y)
        $sum += [math]::Abs($pa.R - $pb.R) + [math]::Abs($pa.G - $pb.G) + [math]::Abs($pa.B - $pb.B)
        $n++
      }
    }
    if ($n -gt 0) {
      $d = $sum / $n / 3
      if ($d -gt 30) { $blocks += [PSCustomObject]@{ X = $bx; Y = $by; Diff = [int]$d } }
    }
  }
}
Write-Output ("so block 32x32 khac biet lon (>30): " + $blocks.Count)
$blocks | Sort-Object Diff -Descending | Select-Object -First 25 | ForEach-Object {
  Write-Output ("  x=" + $_.X + " y=" + $_.Y + "  diff=" + $_.Diff)
}

# So sanh mau nen o goc (nen trang vs nen khac)
Write-Output "`n--- mau pixel tai cac diem ---"
foreach ($pt in @(@(5,5),@(512,5),@(1018,5),@(512,570),@(5,570),@(200,250),@(600,250))) {
  $pa = $a.GetPixel($pt[0], $pt[1]); $pb = $b.GetPixel($pt[0], $pt[1])
  Write-Output ("  (" + $pt[0] + "," + $pt[1] + ")  user=(" + $pa.R + "," + $pa.G + "," + $pa.B + ")  mine=(" + $pb.R + "," + $pb.G + "," + $pb.B + ")")
}

$a.Dispose(); $b.Dispose()
