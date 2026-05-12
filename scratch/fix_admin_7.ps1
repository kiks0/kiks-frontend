$content = Get-Content 'src\pages\Admin.jsx'
$newContent = $content[0..4130]
$newContent += '                                ))'
$newContent += '                        )'
$newContent += $content[4133..($content.Length - 1)]
$newContent | Set-Content 'src\pages\Admin.jsx'
