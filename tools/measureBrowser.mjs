/**
 * Đo viewport CSS THẬT của trang đang mở trong Cốc Cốc, qua UI Automation.
 *
 * Cốc Cốc (Chromium) expose web content cho UIA. Mỗi element text có
 * BoundingRectangle tính bằng pixel VẬT LÝ. Từ đó suy ra viewport CSS bằng
 * cách so tỉ lệ với ảnh chụp màn hình (đã biết là 1024x575 cho cùng vùng).
 */
import { execFileSync } from 'node:child_process';

const ps = `
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes

$root = [System.Windows.Automation.AutomationElement]::RootElement
$winCond = New-Object System.Windows.Automation.PropertyCondition(
  [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
  [System.Windows.Automation.ControlType]::Window)
$wins = $root.FindAll([System.Windows.Automation.TreeScope]::Children, $winCond)

foreach ($w in $wins) {
  $name = $w.Current.Name
  if ($name -notmatch 'C?c C?c|Coc Coc') { continue }
  Write-Output ("WINDOW: '" + $name + "'")
  Write-Output ("  bounds: " + $w.Current.BoundingRectangle)

  # Cac element web (Text / Hyperlink / Group) co bounds nam trong vung web
  $textCond = New-Object System.Windows.Automation.PropertyCondition(
    [System.Windows.Automation.AutomationElement]::ControlTypeProperty,
    [System.Windows.Automation.ControlType]::Text)
  $texts = $w.FindAll([System.Windows.Automation.TreeScope]::Descendants, $textCond)

  $rows = @()
  foreach ($t in $texts) {
    $r = $t.Current.BoundingRectangle
    if ($r.Width -le 0 -or $r.Height -le 0) { continue }
    if ($r.Width -gt 2000) { continue }
    $rows += [PSCustomObject]@{
      Name = $t.Current.Name
      X = [int]$r.X; Y = [int]$r.Y; W = [int]$r.Width; H = [int]$r.Height
      Class = $t.Current.ClassName
    }
  }
  Write-Output ("  so element text: " + $rows.Count)
  if ($rows.Count -gt 0) {
    $minX = ($rows | Measure-Object X -Minimum).Minimum
    $minY = ($rows | Measure-Object Y -Minimum).Minimum
    $maxX = ($rows | Measure-Object X -Maximum).Maximum
    $maxY = ($rows | Measure-Object Y -Maximum).Maximum
    Write-Output ("  text bounds: x " + $minX + ".." + $maxX + "  y " + $minY + ".." + $maxY)
    Write-Output "  --- 25 text dau ---"
    $rows | Sort-Object Y, X | Select-Object -First 25 | ForEach-Object {
      Write-Output ("   [" + $_.X + "," + $_.Y + " " + $_.W + "x" + $_.H + "] " + $_.Class + " :: " + $_.Name)
    }
  }
}
`;

execFileSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'inherit' });
