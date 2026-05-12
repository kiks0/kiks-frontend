$content = Get-Content 'src\pages\Admin.jsx'
$newSection = $content[0..4130]
$newSection += '                                )))'
$newSection += '                        )}'
$newSection += '                    </div>'
$newSection += '                ) : null}'
$newSection += $content[4136..($content.Length - 1)]
$newSection | Set-Content 'src\pages\Admin.jsx'
