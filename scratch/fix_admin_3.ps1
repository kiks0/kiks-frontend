$content = Get-Content 'src\pages\Admin.jsx'
$startIndex = 4063 # line 4064
$endIndex = 4133   # line 4134

$newSection = @()
$newSection += '            {/* LIST SECTION */}'
$newSection += '            {["collections", "products", "promo-codes", "blogs"].includes(activeTab) && ('
$newSection += '                <div className="grid grid-cols-1 gap-4 md:gap-6">'
$newSection += '                    {tabsLoading[activeTab] ? ('
$newSection += '                        <div className="flex items-center justify-center py-20">'
$newSection += '                            <Loader2 className="animate-spin text-black" size={32} />'
$newSection += '                        </div>'
$newSection += '                    ) : ('
$newSection += '                        (activeTab === "collections" ? collections : activeTab === "products" ? products : activeTab === "promo-codes" ? promoCodes : blogs).length === 0 ? ('
$newSection += '                            <div className="text-center py-20 text-black/40 tracking-widest uppercase text-xs bg-neutral-50 border border-black/5">No records found</div>'
$newSection += '                        ) : ('
$newSection += '                            (activeTab === "collections" ? collections : activeTab === "products" ? products : activeTab === "promo-codes" ? promoCodes : blogs).map(item => ('
# We keep the middle part from the original file
$middlePart = $content[4074..4129]
foreach ($line in $middlePart) { $newSection += $line }
$newSection += '                            ))'
$newSection += '                        )'
$newSection += '                    )}'
$newSection += '                </div>'
$newSection += '            )}'

$finalContent = $content[0..4062] + $newSection + $content[4134..($content.Length - 1)]
$finalContent | Set-Content 'src\pages\Admin.jsx'
