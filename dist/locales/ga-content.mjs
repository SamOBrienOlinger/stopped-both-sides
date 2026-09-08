// Working Irish translation. Stable IDs and choice order match the English source.
// Independent Irish-language and legal review remain outstanding.
const n=(title,scene,publicView,gardaView)=>({title,scene,public:publicView,garda:gardaView});
export const gaContent={
 'public-street':{title:'Stoptha ar an tsráid',description:'Fiafraíonn Garda cá bhfuil tú ag dul. An comhrá deonach é, nó an gá duit fanacht?',nodes:{
  'street-start':n('“An bhféadfainn labhairt leat?”','Tá Alex, 24, ag siúl abhaile tar éis seal déanach oibre. Stopann Garda in aice le Alex agus fiafraíonn cá bhfuil Alex ag dul. Níor míníodh aon chion a bhfuil amhras faoi ná aon cheanglas fanacht.',[
   'Cad a déarfá ar dtús?','Féadfaidh Garda fiosrúcháin a dhéanamh. Ní chruthaíonn iarratas chun cainte dualgas dlíthiúil go huathoibríoch fanacht nó freagra a thabhairt; féadfaidh cumhacht shonrach an scéal a athrú.',
   'Mínigh d’oíche ar fad láithreach.','Is féidir leat labhairt más mian leat, ach cuidíonn sé fios a bheith agat ar dtús an comhrá deonach atá ann.',
   'Fiafraigh cén fáth a bhfuil tú á stopadh agus an bhfuil cead agat imeacht.','Lorgaíonn sé seo cuspóir agus stádas na teagmhála gan glacadh leis go bhfuil gach iarratas éigeantach.',
   'Abair nach bhfuil cead ag Gardaí ceisteanna a chur go poiblí riamh.','Is féidir le Gardaí fiosrúcháin ghinearálta a dhéanamh. Is í an cheist an bhfuil freagra nó gníomh áirithe riachtanach faoin dlí.'
  ],[
   'Mar Gharda, conas a chuirfeá stádas an fhiosrúcháin in iúl go soiléir?','Mínigh an cuspóir agus an bhfuil cead ag an duine imeacht. Ní chruthaíonn fiosrúchán ginearálta cumhacht coinneála. Ní hionann toilteanas labhairt agus ciontacht nó neamhchiontacht.',
   'Soiléirigh gur fiosrúchán deonach é agus mínigh a chuspóir.','Cuidíonn sé le Alex cinneadh a dhéanamh gan dualgas nach bhfuil bunaithe a thabhairt le tuiscint.',
   'Lig do Alex glacadh leis go gcaithfear gach ceist a fhreagairt.','D’fhéadfadh doiléire brú a chruthú i gcomhrá a bhfuil cuma dheonach air. Soiléirigh an scéal.'
  ]),
  'street-status':n('Cad a athraíonn an scéal?','Míníonn an Garda gur fiosrúchán ginearálta é agus nach bhfuil Alex faoi choinneáil. Fiafraíonn an cleachtadh anois cad a d’fhéadfadh iarratas eile a dhéanamh éigeantach.',[
   'Cén t-idirdhealú atá tábhachtach?','I gcás cionta áirithe, d’fhéadfadh éileamh dleathach d’ainm agus do sheoladh a éileamh. Ná glac leis go bhfuil gach ceist éigeantach ná go bhfuil sonraí aitheantais roghnach i gcónaí.',
   'Bíonn gach ceist éigeantach nuair a chuireann Garda in éide í.','Ní dhéanann éide ceist éigeantach de gach fiosrúchán ginearálta.',
   'Ní gá sonraí aitheantais a thabhairt riamh mura gciontaítear tú.','Éilíonn cumhachtaí áirithe sonraí aitheantais roimh chúiseamh nó ciontú.',
   'Braitheann an ceanglas ar an gcumhacht dhlíthiúil agus ar na cúinsí.','Tá an bunús dlíthiúil tábhachtach. Fiafraigh faoi mura bhfuil an scéal soiléir.'
  ],[
   'Cad is gá a sheiceáil sula n-éilíonn tú sonraí aitheantais?','Sainaithin an chumhacht ábhartha agus seiceáil go bhfuil a coinníollacha comhlíonta. Ní leor éide ná fonn ginearálta eolas a fháil.',
   'An chumhacht shonrach agus na fíricí a thacaíonn lena húsáid.','Coinníonn tú iarratas deonach ar leithligh ó éileamh reachtúil.',
   'An bhfuil cuma drogallach ar Alex cabhrú.','Ní chomhlíonann drogall ann féin coinníollacha cumhachta chun sonraí aitheantais a éileamh.'
  ]),
  'street-voluntary':n('Comhrá deonach','Tá roinnt ceisteanna freagartha ag Alex. Deimhníonn an Garda go bhfuil cead ag Alex imeacht agus fiafraíonn an dtiocfaidh Alex chuig an stáisiún chun cabhrú le fiosrúcháin ghinearálta.',[
   'Cad é an chéad chéim úsáideach eile?','Fiafraigh an bhfuil an freastal deonach agus an féidir leat imeacht. Ní thugann tú suas do chearta trí dhul go deonach; d’athródh gabháil dhleathach ina dhiaidh sin an stádas.',
   'Soiléirigh an cuspóir agus an bhfuil an freastal deonach.','Is féidir leat cinneadh eolasach a dhéanamh agus comhairle dlí a lorg má tá imní ort.',
   'Glac leis go gcaithfidh tú fanacht ar feadh tréimhse éiginnte má théann tú isteach i stáisiún.','Ní cumhacht coinneála é cuairt ar stáisiún ann féin. Soiléirigh do stádas.',
   'Glac leis nach bhféadfaí aon rud a deirtear go deonach a úsáid mar fhianaise.','Ná bí ag brath ar an tuiscint sin. Lorg comhairle dlí dá bhféadfadh na ceisteanna tú a cheangal le cion.'
  ],[
   'Conas ba chóir an cuireadh a mhíniú?','Ba chóir a rá go soiléir go bhfuil freastal deonach deonach. Ní thugann an suíomh cumhacht coinneála ná ní bhaineann sé an deis comhairle a lorg.',
   'Mínigh an cuspóir, an stádas deonach agus an deis comhairle dlí a lorg.','Is féidir le Alex an cuireadh a mheas agus tuiscint níos soiléire aige ar an scéal.',
   'Tabhair le tuiscint nach féidir le Alex imeacht tar éis dul isteach sa stáisiún.','Ní cumhacht coinneála é an foirgneamh. Teastaíonn bunús dleathach ar leith le srian.'
  ]),
  'street-details':n('Éileamh faoin dlí anois','Leagan ar leith: deir an Garda go bhfuil cúis réasúnach le hamhras gur úsáid Alex iompar bagrach faoi alt 6 den Acht um Ord Poiblí, agus éilíonn ainm agus seoladh faoi alt 24. Cuireann Alex in aghaidh an líomhaint. Tá sé tábhachtach go gcomhlíonfaí na coinníollacha reachtúla.',[
   'Conas is féidir freagairt don éileamh?','Nuair a dhéantar éileamh faoi alt 24 go dleathach, is cion é diúltú nó sonraí ainm agus seolta atá bréagach nó míthreorach a thabhairt. Ní admháil faoin iompar líomhnaithe é sonraí cearta a thabhairt.',
   'Tabhair ainm bréige chun an scéal a choinneáil príobháideach.','D’fhéadfadh sonraí bréagacha nó míthreoracha mar fhreagra ar an éileamh dleathach seo cion ar leith a chruthú.',
   'Tabhair sonraí cearta agus fiafraigh ar leithligh faoin líomhain agus faoi chomhairle dlí.','Is féidir an ceanglas aitheantais a chomhlíonadh agus an líomhain a chonspóid fós.',
   'Diúltaigh d’ainm a thabhairt go dtí go gcruthófar an líomhain sa chúirt.','Ní fhanann an dualgas aitheantais go dtí ciontú. Is féidir comhairle a lorg chun dleathacht an éilimh a cheistiú.'
  ],[
   'Cad ba chóir a choinneáil ar leithligh agus an t-éileamh á mhíniú?','Is ceisteanna éagsúla iad éileamh dleathach ar shonraí aitheantais agus cruthúnas ar an iompar líomhnaithe. Mínigh an chumhacht agus na forais go cruinn; ná cuir comhlíonadh i láthair mar admháil.',
   'Seiceáil agus mínigh an bunús reachtúil; déan idirdhealú idir sonraí agus admháil.','Caomhnaíonn sé seo an ceanglas dlíthiúil, nuair is infheidhme, agus cumas Alex an líomhain a chonspóid.',
   'Caith le hainm a thabhairt mar admháil ar iompar bagrach.','Ní chruthaíonn sonraí aitheantais cearta gur tharla an t-iompar líomhnaithe.'
  ]),
  'street-end':n('Imeacht le tuiscint shoiléir','Tá deireadh leis an teagmháil agus tá sé ráite le Alex gur féidir imeacht. Tá Alex fós míshuaimhneach faoin gcóireáil agus ag smaoineamh ar an gcéad chéim eile.',[
   'Cad a d’fhéadfá a dhéanamh ina dhiaidh sin?','Nuair atá sé sábháilte, scríobh síos cad a tharla agus lorg comhairle má cheapann tú gur sáraíodh do chearta. Is bealaí éagsúla iad gearán agus agóid dhlíthiúil.',
   'Coinnigh nóta fíorasach agus smaoinigh ar chomhairle nó gearán.','Tá eolas caomhnaithe agat gan gá le breithiúnas dlíthiúil a dhéanamh tú féin.',
   'Glac leis nach féidir gearán a dhéanamh má ligtear duit imeacht.','Féadfaidh teagmháil críochnú gan ghabháil agus imní faoin gcóireáil a fhágáil fós.',
   'Glac leis go gcruthaíonn gearán go huathoibríoch go raibh an stad neamhdhleathach.','Cuireann gearán imní faoi bhráid measúnaithe; ní chinneann sé dleathacht ann féin.'
  ],[
   'Mar Gharda, cad a thacaíonn le cuntasacht tar éis na teagmhála?','Ní réitíonn deireadh na teagmhála imní faoin mbunús nó faoin gcóireáil. Caomhnaigh cuntas cruinn agus cabhraigh le rochtain ar eolas agus ar an bpróiseas gearán cuí.',
   'Taifead na fíricí go cruinn agus tabhair eolas soiléir má ardaítear imní.','Ceadaíonn sé athbhreithniú gan an toradh a réamhchinneadh.',
   'Abair nach féidir gearán a dhéanamh tar éis scaoilte.','D’fhéadfadh imní faoin gcóireáil fanacht nuair atá cead ag duine imeacht.'
  ])
 }},
 'public-search':{title:'Iarrtar ort do mhála a oscailt',description:'Deirtear leat go ndéanfar cuardach ar do mhála. Fiosraigh an difríocht idir toiliú agus cumhacht dhlíthiúil.',nodes:{
  'search-start':n('“Oscail do mhála, le do thoil.”','Tá Niamh, 29, ag fanacht ar bhus. Deir Garda gur mian leo mála Niamh a chuardach. Níor míníodh cúis ná cumhacht dhlíthiúil fós.',[
   'Cad a chuideodh leat an t-iarratas a thuiscint?','Fiafraigh cén fáth a bhfuil an cuardach beartaithe agus cén chumhacht atá á húsáid. Ná glac leis go mbíonn do thoiliú nó barántas riachtanach do gach cuardach.',
   'Fiafraigh faoi na forais agus faoin gcumhacht dhlíthiúil.','Soiléiríonn sé seo an gníomh beartaithe agus an difríocht idir iarratas ar thoiliú agus cuardach reachtúil.',
   'Abair go bhfuil gach cuardach gan bharántas páipéir neamhdhleathach.','Ceadaíonn reachtaíocht áirithe cuardach gan bharántas má chomhlíontar a coinníollacha.',
   'Glac leis gur ionann iarratas ar thoiliú agus cuardach reachtúil.','Is bunúis dhlíthiúla éagsúla iad. Fiafraigh cén ceann atá i gceist.'
  ],[
   'Mar Gharda, cad ba chóir a dhéanamh sula dtéann tú ar aghaidh?','Sainaithin agus meas an bunús iarbhír don chuardach, ansin mínigh é. Ní hionann iarratas ar thoiliú agus cuardach reachtúil.',
   'Seiceáil na forais agus an chumhacht, agus mínigh iad do Niamh.','Ba chóir don mhíniú bunús atá ann cheana a léiriú, seachas ceann a chruthú tar éis an chinnidh.',
   'Caith le mála a oscailt faoi bhrú mar chruthúnas go bhfuil an cuardach deonach.','Ní léiríonn comhlíonadh dealraitheach go bhfuil toiliú bailí nó bunús reachtúil ann.'
  ]),
  'search-power':n('Cumhacht chuardaigh shonrach','Tugann an Garda cúis le hamhras faoi sheilbh neamhdhleathach druga rialaithe agus luann alt 23. Cuireann Niamh in aghaidh an amhrais. Níl dóthain sonraí sa radharc chun a chinneadh go neamhspleách an leor na forais a luaitear.',[
   'Cad air a mbraitheann an chumhacht sin?','Éilíonn alt 23 cúis réasúnach le hamhras faoi sheilbh neamhdhleathach druga rialaithe. Ceadaíonn sé cuardach gan bharántas agus coinneáil atá riachtanach go réasúnach dó. Ní chruthaíonn dearbhú Garda amháin go bhfuil na forais dleathach.',
   'Ní féidir í a úsáid go dtí go bhfaigheann breitheamh ciontach tú.','Féadfaidh cumhacht chuardaigh teacht chun cinn le linn imscrúdaithe, roimh chiontú.',
   'Teastaíonn cúis réasúnach le hamhras; ní cumhacht gan teorainn í.','Sin an coinníoll dlíthiúil atá le meas. Is féidir le haturnae comhairle a thabhairt ar comhlíonadh é.',
   'Baintear gach teorainn den chuardach má deirtear “alt 23”.','Bíonn na coinníollacha agus na teorainneacha i bhfeidhm fós nuair a luaitear an t-alt.'
  ],[
   'Cad is gá a mheas seachas alt 23 a ainmniú?','Caithfear an ceanglas maidir le cúis réasúnach agus teorainneacha na cumhachta a chomhlíonadh. Ní bhunaíonn uimhir ailt na fíricí ná ní chinneann sí agóid níos déanaí.',
   'Cáilíocht an eolais agus an bhfuil na coinníollacha reachtúla comhlíonta.','Measann tú bunús an chinnidh seachas brath ar lipéad.',
   'An bhfuil ainm an Achta ráite os ard agat, agus sin amháin.','Ní chruthaíonn ainmniú cumhachta gur cuireadh i bhfeidhm go dleathach í.'
  ]),
  'search-disagree':n('Ní aontaíonn tú leis an gcuardach','Deir an Garda go leanfar leis an gcuardach faoi alt 23. Tá Niamh imníoch agus ba mhaith léi agóid a dhéanamh. Baineann an cleachtadh le freagairt d’easaontas; ní dhearbhaíonn sé go neamhspleách dleathacht an chuardaigh chonspóidigh.',[
   'Conas a d’fhéadfá do sheasamh a chur in iúl?','Ní chuireann easpa toilithe cosc ar chuardach a bhfuil cumhacht dhleathach taobh thiar de. D’fhéadfadh bac ar fheidhmiú dleathach cumhachtaí cuardaigh drugaí a bheith ina chion. Is féidir agóid a rá agus comhairle a lorg ina dhiaidh sin.',
   'Tarraing an mála uait agus cuir bac fisiciúil ar an gcuardach.','D’fhéadfadh iarmhairtí dlíthiúla a bheith le bac fisiciúil ar chuardach dleathach. Is féidir agóid a rá gan fórsa.',
   'Abair go dtoilíonn tú mar go gcaillfeá an ceart ceisteanna a chur murach sin.','Ní gá cuardach a chur síos mar chuardach toilithe chun fiafraí cad atá ag tarlú.',
   'Cuir d’agóid in iúl, seachain bac fisiciúil agus cuimhnigh ar na sonraí.','Cuireann sé seo do sheasamh in iúl agus fágann an cheist dhlíthiúil le plé trí chomhairle.'
  ],[
   'Conas ba chóir freagairt d’agóid ó bhéal?','Déan idirdhealú idir easaontas agus bac fisiciúil. Lean ag meas an bhunúis dhlíthiúil agus mínigh an próiseas gan an agóid a úsáid mar fhoras nua amhrais.',
   'Éist, mínigh na forais a luaitear agus déan idirdhealú idir agóid agus bac.','Ní bhaineann agóid an duine do fhreagracht gníomhú go dleathach agus le meas.',
   'Caith le ceist ar bith faoin gcuardach mar chion inti féin.','Ní bac ar chuardach dleathach go huathoibríoch é ceist nó agóid ó bhéal.'
  ]),
  'search-end':n('Tá deireadh leis an gcuardach','Ní aimsítear druga rialaithe sa chuardach ficseanúil. Deirtear le Niamh gur féidir imeacht. Ba mhaith léi measúnú ar an údar agus ar an gcóireáil.',[
   'Cad ba chóir an measúnú sin a threorú?','Ní dhéanann toradh folamh cuardach neamhdhleathach go huathoibríoch. Tá an bunús dlíthiúil agus na forais ag an am tábhachtach. Lorg comhairle agus tabhair cuntas fíorasach.',
   'Na forais ag an am agus an raibh na coinníollacha dlíthiúla comhlíonta.','Cuideoidh taifead fíorasach le haturnae an chumhacht agus an chóireáil a mheas.',
   'Tá gach cuardach gan toradh neamhdhleathach go huathoibríoch.','Ní fhreagraíonn an toradh amháin an cheist ar chomhlíon na forais an tástáil dhlíthiúil.',
   'Ní féidir cuardach a cheistiú riamh má ainmníonn Garda Acht.','Ní chruthaíonn ainmniú reachtaíochta gur comhlíonadh a coinníollacha.'
  ],[
   'Cad ba chóir go bhféadfadh athbhreithneoir scrúdú i do chuntas?','Tá an t-eolas agus an bunús dlíthiúil ag an am, seoladh an chuardaigh agus na himeachtaí ina dhiaidh tábhachtach. Ní chinneann an toradh amháin dleathacht.',
   'Taifead na forais, an t-am, na gníomhartha agus an toradh go cruinn.','Tacaíonn sé seo le hathbhreithniú ar an gcinneadh agus ar an gcóireáil iarbhír.',
   'Cuir forais níos láidre leis ina dhiaidh sin mar nár aimsíodh rud ar bith.','Tugann forais a chur leis ina dhiaidh sin pictiúr mícheart den eolas a bhí ar fáil ag an am.'
  ])
 }}
};
Object.assign(gaContent,{
 'public-arrest':{title:'Deirtear leat go bhfuil tú faoi ghabháil',description:'Líomhain, gabháil agus ceisteanna sa stáisiún. Cleachtaigh conas agus cathain comhairle dlí a iarraidh.',nodes:{
  'arrest-start':n('Tá tú faoi ghabháil','Deir Garda le Daniel, 32, go bhfuil sé faoi ghabháil faoi eachtra i siopa. Measann Daniel gur aithníodh an duine mícheart. Ní ghlactar leis sa chleachtadh go bhfuil an líomhain fíor.',[
   'Cad a d’iarrfá?','Tá tú i dteideal an chúis leis an ngabháil a fháil. Ní ciontú í gabháil. Iarr aturnae agus mínigh do chuid imní.',
   'Glacadh leis go bhfuilim ciontach cheana toisc gur gabhadh mé.','Is céimeanna éagsúla iad gabháil agus cinneadh ciontachta.',
   'An chúis a iarraidh agus aturnae a iarraidh, gan cur in aghaidh go fisiciúil.','Is féidir an líomhain a dhíospóid agus an ghabháil a cheistiú trí chúnamh dlí.',
   'Mé féin a tharraingt saor toisc go bhfuil an líomhain mícheart.','D’fhéadfadh cur in aghaidh go fisiciúil an baol a mhéadú. Lorg cúnamh dlí.'
  ],[
   'Cad is gá a mhíniú agus a athmheas?','Mínigh an chúis, éascaigh cúnamh dlí agus scrúdaigh eolas a d’fhéadfadh an t-aitheantas a bhréagnú. Ní cruthúnas ciontachta í gabháil.',
   'An chúis a mhíniú, freagairt don iarratas ar chomhairle agus an t-aitheantas a sheiceáil.','Tá an líomhain fós le scrúdú; ní cruthúnas í an ghabháil.',
   'Neamhaird a dhéanamh den earráid fhéideartha toisc gur fógraíodh an ghabháil.','Ní éiríonn eolas contrártha neamhábhartha toisc go ndearnadh cinneadh cheana.'
  ]),
  'arrest-lawyer':n('Déanaimis é seo a réiteach','Sula dtosaíonn agallamh, fiafraítear de Daniel faoi chomhairle dlí. Tá imní air go príobháideach go mbeadh cuma chiontach air dá n-iarrfadh sé aturnae. Tá a fhios sin ag an bhfoghlaimeoir; níor cheart don Gharda glacadh leis go bhfuil an imní sin air.',[
   'Cad a dhéanfá roimh an agallamh?','Tá ceart agat ar chomhairle dlí faoi rún. Iarr aturnae roimh agallamh agus a láithreacht lena linn. Ní admháil chiontachta é sin.',
   'Comhairle dlí faoi rún agus láithreacht aturnae a iarraidh.','Is féidir an líomhain, an fhianaise agus na ceisteanna a phlé sula ndéanann tú cinneadh.',
   'Comhairle a dhiúltú mar go ráthaíonn sé scaoileadh luath.','Níl ráthaíocht den sórt sin ann. Is féidir leat comhairle a iarraidh arís.',
   'Iarraidh ar an nGarda atá ag cur agallaimh orm bheith mar dhlíodóir neamhspleách agam.','Ní hé an Garda d’aturnae neamhspleách. Iarr aturnae.'
  ],[
   'Conas a mhíneofá rochtain ar chomhairle?','Éascaigh comhairle faoi rún agus na cosaintí cuí. Ní admháil é ceart a úsáid.',
   'Comhairle agus láithreacht aturnae a mhíniú gan tuairimí faoi chiontacht.','Tacaíonn sé seo le rogha eolasach.',
   'A rá go ráthaíonn diúltú d’aturnae scaoileadh luath.','Cuireann gealltanas gan bhunús brú ar dhuine ceart a thabhairt suas. Tabhair deis athmhachnaimh.'
  ]),
  'arrest-reconsider':n('Is féidir iarraidh arís','Dhiúltaigh Daniel do chomhairle ar dtús. Anois, roimh an agallamh, níl sé cinnte faoin gcinneadh sin.',[
   'An gá dó cloí leis an gcéad chinneadh?','Is féidir d’intinn a athrú. Abair go soiléir leis an gcomhalta i bhfeighil go dteastaíonn aturnae uait. Cuidíonn comhairle leat na cosaintí agallaimh a thuiscint.',
   'Is gá; ní féidir aturnae a iarraidh arís.','Is féidir d’intinn a athrú agus é sin a rá leis an gcomhalta i bhfeighil.',
   'Ní gá; is féidir comhairle a iarraidh anois.','Ní chuireann an cinneadh roimhe seo cosc ar iarratas anois.',
   'Fanacht i mo thost agus súil agam go dtabharfar faoi deara é.','Ní gá do dhuine eile buille faoi thuairim a thabhairt. Abair go dteastaíonn comhairle uait.'
  ],[
   'Iarrann Daniel comhairle anois. Cad a dhéanann tú?','Ní diúltú buan é an cinneadh tosaigh. Freagair don iarratas reatha agus cuir na cosaintí cuí i bhfeidhm.',
   'An t-iarratas a aithint agus comhairle a shocrú.','Ní chuireann a chinneadh roimhe seo cosc ar iarratas anois.',
   'An chéad diúltú a mheas mar chinneadh deiridh.','Ní tairiscint aonuaire í rochtain ar chomhairle.'
  ]),
  'arrest-silence':n('Cad faoin gceart fanacht i do thost?','Labhraíonn Daniel lena aturnae faoi rún faoi rabhadh maidir le tost. Níl an Garda páirteach sa chomhrá sin. Tá freagracht dhifriúil ar gach ról.',[
   'Cén ráiteas is cruinne?','Tá ceart ginearálta agat fanacht i do thost, ach tá eisceachtaí ann. Is ceisteanna ar leith iad sonraí a chaithfear a thabhairt agus tátail áirithe ó thost. Faigh comhairle faoin rabhadh; ná glac leis nach féidir iarmhairt ar bith a bheith ann.',
   'Cuireann tost cosc i gcónaí ar chás dul ar aghaidh.','D’fhéadfadh fianaise eile agus forálacha áirithe a bheith ábhartha.',
   'Baineann gabháil an ceart sin díom go hiomlán.','Ní bhaineann. Is féidir le haturnae na heisceachtaí a mhíniú.',
   'Tá ceart ginearálta ann, ach teastaíonn comhairle faoi dhualgais agus eisceachtaí ar leith.','Seachnaíonn sé seo rialacha míchearta a mhaíonn go mbaineann siad le gach cás.'
  ],[
   'Cad í do fhreagracht lasmuigh den chomhairliúchán?','Tabhair meas ar rúndacht agus bain úsáid chruinn as rabhaidh agus nósanna imeachta. Ná ceangail comhairle dlí ná úsáid cearta le ciontacht.',
   'Meas a léiriú ar an gcomhrá príobháideach agus na rabhaidh agus cosaintí cuí a chur i bhfeidhm.','Tacaíonn sé seo le cinneadh eolasach gan cur isteach ar chomhairle faoi rún.',
   'Éileamh an chomhairle a chloisteáil chun í a cheadú.','Ní gá cead an agallóra do chomhairle dlí neamhspleách.'
  ]),
  'arrest-time':n('Cá fhad is féidir leis seo maireachtáil?','Tar éis uaireanta sa stáisiún, fiafraíonn Daniel faoin teorainn ama coinneála. Ní shonraíonn an scéal cumhacht coinneála ná síneadh ar leith.',[
   'Cad a d’iarrfá?','Braitheann an teorainn ar an reachtaíocht agus ar na cúinsí, lena n-áirítear síntí agus am nach n-áirítear. Iarr an chumhacht agus iarr ar d’aturnae an taifead agus an ríomh a sheiceáil.',
   'Iarraidh ar an gcomhalta i bhfeighil agus ar an aturnae an teorainn sa chás seo a mhíniú.','Teastaíonn an teorainn a bhaineann leis an gcás seo, seachas uimhir a mheabhraítear.',
   'Glacadh leis go bhfuil aon teorainn amháin ann do gach gabháil.','Tá teorainneacha agus cosaintí éagsúla ag cumhachtaí éagsúla.',
   'Glacadh leis gur féidir coinneáil gan teorainn ama.','Tá teorainneacha dlíthiúla ann agus is féidir coinneáil a cheistiú.'
  ],[
   'Conas a mhíneofá an teorainn?','Seiceáil an t-údarás coinneála iarbhír, aon síneadh agus an ríomh ama. Níl aon teorainn uilíoch ná cumhacht gan teorainn ann.',
   'An t-údarás agus an taifead a sheiceáil agus an ríomh a mhíniú.','Baineann an míniú leis an gcoinneáil seo.',
   'Teorainn amháin a úsáid do gach cás de ghlanmheabhair.','Tá seiceálacha dá gcuid féin ag cumhachtaí éagsúla.'
  ])
 }},
 'public-custody':{title:'An stáisiún a thuiscint',description:'Ateangaire, comhairle dlí, cógais agus duine a chur ar an eolas: cleachtaigh cabhair a iarraidh.',nodes:{
  'custody-start':n('Tá na focail neamhchoitianta','Labhraíonn Maya, 34, Béarla laethúil ach tá deacracht aici an míniú dlíthiúil a thuiscint. Tá imní uirthi go n-aontódh sí gan tuiscint.',[
   'Cad is féidir leat a iarraidh?','Tá ateangaireacht agus aistriúchán saor in aisce ar fáil nuair is gá faoi choimeád. Abair cén tacaíocht atá ag teastáil.',
   'Mo cheann a chlaonadh ionas nach mbeidh mé deacair.','Ní cruthúnas tuisceana é ceann a chlaonadh. Mínigh do riachtanas.',
   'Ateangaire a iarraidh agus a rá nach dtuigim.','Lorg tacaíocht sula ndéanann tú cinntí faoi agallamh nó doiciméid.',
   'Glacadh leis nach féidir aturnae a bheith agam má theastaíonn ateangaire.','Is féidir le hateangaire tacú le cumarsáid faoi rún le haturnae.'
  ],[
   'Cad a sheiceálfá sula nglacann tú le haontú mar thuiscint?','Ní hionann Béarla comhrá agus tuiscint ar mhíniú dlíthiúil. Aithin riachtanais tacaíochta.',
   'Tuiscint a sheiceáil agus ateangaire a shocrú nuair is gá.','Teastaíonn tacaíocht roimh chinntí a bhfuil iarmhairtí acu.',
   'Ceann a chlaonadh nó líofacht a mheas mar chruthúnas tuisceana.','D’fhéadfadh riachtanas tacaíochta a bheith i bhfolach.'
  ]),
  'custody-lawyer':n('Imní faoin gcostas','Teastaíonn aturnae ó Maya ach níl aithne aici ar dhuine ar bith agus tá imní uirthi faoin gcostas. Níor pléadh incháilitheacht do chúnamh fós.',[
   'Cad í an chéad chéim eile?','Iarr aturnae agus eolas faoi Scéim Comhairle Dlí Stáisiúin na nGardaí. Seiceáil na coinníollacha; ná glac leis nach bhfuil cabhair ar fáil ná go n-íoctar gach táille.',
   'Éirí as mar nach bhfuil aithne agam ar aturnae.','Abair leis an gcomhalta i bhfeighil agus fiafraigh faoin gcabhair atá ar fáil.',
   'Glacadh leis go n-íocann an Stát gach táille phríobháideach go huathoibríoch.','Fiafraigh faoi incháilitheacht agus faoi na socruithe.',
   'Aturnae a iarraidh agus coinníollacha na scéime a sheiceáil.','Faigh míniú ar na roghanna agus ar na costais.'
  ],[
   'Conas a dhéanann tú rochtain intuigthe?','Mínigh conas aturnae a iarraidh agus na coinníollacha cuí. Ní diúltú é easpa eolais ná imní faoi chostas.',
   'Na socruithe agus an incháilitheacht a mhíniú.','Ní gá do Maya buille faoi thuairim a thabhairt faoi chabhair.',
   'Easpa sonraí teagmhála aturnae a mheas mar cheart a thabhairt suas.','Ní diúltú comhairle é gan teagmhálaí a bheith aici.'
  ]),
  'custody-health':n('Cógais agus sláinte','Tá cógas ordaithe le glacadh ag Maya agus mothaíonn sí tinn. Níor inis sí don fhoireann fós. Tá a fhios ag an bhfoghlaimeoir; níor cheart don Gharda glacadh leis go bhfuil eolas nár nochtadh aige.',[
   'Cad a dhéanfá?','Inis don chomhalta i bhfeighil faoi thinneas, gortú nó cógas. Iarr aire leighis agus tacaíocht leasa nuair is gá.',
   'An riachtanas a mhíniú agus aire leighis a iarraidh.','Is féidir leis an bhfoireann cabhair chuí a shocrú.',
   'Fanacht i mo thost mar gur gá fanacht go mbeidh an t-agallamh thart.','Luaigh riachtanais sláinte nuair a thagann siad chun cinn.',
   'Cógas a ghlacadh gan insint don fhoireann.','Inis don fhoireann ionas gur féidir an riachtanas a mheas agus a bhainistiú go sábháilte.'
  ],[
   'Cad a dhéanann tú gan diagnóis a thomhas?','Éascaigh iarratais leasa, glac dáiríre leo agus socraigh aire leighis chuí. Ná déan toimhdí cliniciúla.',
   'Fiafraí faoi riachtanais, cabhair a mhíniú agus í a shocrú.','Tugann sé seo bealach chun riachtanas a nochtadh agus tacaíocht a fháil.',
   'Glacadh leis nach bhfuil imní sláinte ann mar go bhfuil Maya ina tost.','B’fhéidir nach bhfuil a fhios aici conas cabhair a iarraidh.'
  ]),
  'custody-contact':n('Tá duine ag fanacht leat','Tá deirfiúr Maya ag súil léi sa bhaile. Teastaíonn ó Maya go gcuirfí in iúl di go bhfuil sí á coinneáil agus cén stáisiún ina bhfuil sí.',[
   'An féidir leat é sin a iarraidh?','Is féidir le duine fásta faoi choimeád iarraidh go gcuirfí duine eile ar an eolas. Ní hionann é agus úsáid phearsanta gan teorainn ar ghuthán.',
   'Is é úsáid gan teorainn ar mo ghuthán féin an t-aon bhealach.','Tá fógra do dhuine eile éagsúil ó úsáid phearsanta ghutháin.',
   'Iarraidh go gcuirfí mo dheirfiúr ar an eolas faoin gcoinneáil agus faoin áit.','Abair go soiléir cé ba chóir a chur ar an eolas agus cén t-eolas atá le tabhairt.',
   'Ní ceadmhach ach don aturnae a bheith ar an eolas.','Is féidir iarraidh go gcuirfí duine eile ar an eolas freisin.'
  ],[
   'Conas a mhíníonn tú an difríocht?','Déan idirdhealú idir duine a chur ar an eolas agus úsáid phearsanta ar ghuthán.',
   'An próiseas fógra a mhíniú agus a éascú.','Bíonn an cuspóir agus an próiseas soiléir.',
   'Gach fógra a dhiúltú mar nach bhfuil úsáid ghutháin gan teorainn ar fáil.','Is iarratas ar leith é duine a chur ar an eolas.'
  ])
 }}
});
Object.assign(gaContent,{
 'public-young-person':{title:'Tá tú sé bliana déag d’aois',description:'Tá cosaintí breise ann faoi bhun 18. Foghlaim faoi chúnamh ó aturnae agus ó thuismitheoir, caomhnóir nó duine fásta eile.',nodes:{
  'youth-start':n('Ní theastaíonn uait imní a chur ar dhuine ar bith','Gabhadh Jamie, 16, agus tugadh go stáisiún é. Tá náire ar Jamie agus tá sé ag smaoineamh ar a rá go bhfuil sé 18. Is smaoineamh príobháideach é seo; níl an t-eolas sin ag an nGarda.',[
   'Cad ba chóir duit a rá leis an gcomhalta i bhfeighil?','Tá cosaintí breise ann do dhaoine faoi bhun 18. Tabhair d’aois cheart. Iarr míniú ar do chearta agus teagmháil le do thuismitheoir nó caomhnóir.',
   'A rá go bhfuil mé 18 chun an náire a laghdú.','Tá d’aois cheart tábhachtach do na cosaintí agus don tacaíocht chuí.',
   'Gan m’aois a lua agus glacadh leis go bhfuil a fhios ag gach duine.','Abair d’aois go soiléir ionas gur féidir na socruithe cuí a dhéanamh.',
   'M’aois cheart a thabhairt agus tacaíocht ó dhuine fásta agus aturnae a iarraidh.','Tá d’aois agus an cúnamh atá ag teastáil soiléir anois.'
  ],[
   'Cad a dhéanann tú maidir le haois agus tuiscint?','Faigh amach an aois, taifead go cúramach í agus cuir cosaintí cuí leanaí i bhfeidhm. Ní ghlacann cuma ná muinín áit eolais.',
   'Aois agus tuiscint a shoiléiriú agus cosaintí linbh a shocrú.','Baineann an próiseas le cúinsí iarbhír Jamie.',
   'Caitheamh le duine óg ard nó muiníneach mar dhuine fásta gan seiceáil.','Ní foinse iontaofa aoise í cuma.'
  ]),
  'youth-adult':n('Luaitear agallamh','Tá agallamh le Jamie, 16, beartaithe. Níl tuismitheoir tagtha agus níl duine fásta eile socraithe. Ní shonraítear eisceacht phráinneach sa chleachtadh.',[
   'Cad faoi a d’fhiafrófá?','Go ginearálta, cuirtear agallamh ar leanbh faoi choinneáil i láthair tuismitheora, caomhnóra nó duine fásta eile ainmnithe ag an gcomhalta i bhfeighil. Tá eisceachtaí ar leith in alt 61; ná glac leis nach bhfuil aon cheann ann.',
   'Fiafraí faoi láithreacht duine fásta agus míniú ar aon eisceacht bheartaithe a iarraidh.','Ardaíonn sé seo an chosaint agus aithníonn sé eisceachtaí sainithe sa dlí.',
   'Glacadh leis go nglacann an Garda agallaimh áit an duine fásta tacaíochta go huathoibríoch.','Ní féidir leis an duine fásta ainmnithe faoin riail seo bheith ina Gharda.',
   'Glacadh leis nach féidir leanbh a cheistiú gan tuismitheoir in aon chúinse.','Tá an chosaint ghinearálta tábhachtach, ach tá eisceachtaí agus socruithe do dhuine fásta eile san Acht.'
  ],[
   'Cad is gá a sheiceáil sula dtosaítear?','Seiceáil cosaintí Acht na Leanaí, socruithe an duine fásta chuí agus cúnamh dlí. Ní mór coinníollacha agus údarú iarbhír aon eisceachta a chomhlíonadh; ní leor áisiúlacht.',
   'Na cosaintí a shocrú agus a sheiceáil an mbaineann eisceacht dhleathach ar leith leis an gcás.','Teastaíonn aird ar easpa duine fásta roimh an agallamh.',
   'Dul ar aghaidh mar go gcuirfeadh fanacht isteach ar an sceideal.','Ní eisceacht reachtúil í áisiúlacht an sceidil inti féin.'
  ]),
  'youth-solicitor':n('“Is féidir le do thuismitheoir comhairle a thabhairt.”','Tá tuismitheoir Jamie tagtha agus ba mhaith leis cabhrú. Teastaíonn comhairle dlí neamhspleách fós ó Jamie faoin líomhain.',[
   'An nglacann tacaíocht duine fásta áit aturnae?','Tacaíonn tuismitheoir nó duine fásta leis an leanbh; ní ghlacann sé áit comhairle dlí neamhspleáiche. Is féidir leis an leanbh nó leis an duine fásta cuí aturnae a iarraidh faoi alt 60.',
   'Glacann: cuireann láithreacht tuismitheora deireadh leis an gceart aturnae a iarraidh.','Is cineálacha éagsúla tacaíochta iad. Is féidir comhairle dlí a iarraidh freisin.',
   'Ní ghlacann: aturnae a iarraidh chomh maith le tacaíocht duine fásta.','Is féidir an dá riachtanas a lua leis an gcomhalta i bhfeighil.',
   'Ní féidir ach le leanaí a bhfuil aithne acu ar aturnae ceann a iarraidh.','Is féidir aturnae a iarraidh gan gnólacht ar leith a ainmniú.'
  ],[
   'Conas a fhreagraíonn tú don iarratas ar aturnae?','Tá róil éagsúla ag duine fásta tacaíochta agus ag aturnae. Ní chuireann láithreacht duine fásta deireadh le comhairle neamhspleách ná le cosaintí agallaimh.',
   'Freagairt don iarratas ar aturnae agus ról tacaíochta an tuismitheora a choinneáil.','Tá cuspóir ar leith ag an dá chosaint.',
   'A rá le Jamie nach bhfuil gá le haturnae nuair atá tuismitheoir ann.','Meascann sé seo tacaíocht agus comhairle dlí neamhspleách go mícheart.'
  ]),
  'youth-understand':n('Doiciméad nach dtuigeann tú','Iarrtar ar Jamie cuntas scríofa a shíniú. Tugann Jamie faoi deara abairt nach léiríonn an rud a bhí i gceist aige.',[
   'Cén freagra atá úsáideach?','Ná sínigh cuntas mar chuntas cruinn gan é a thuiscint. Iarr míniú, ceartúcháin agus comhairle dlí. Ní ráthaíocht scaoilte í síniú.',
   'Síniú mar nach bhfuil i ngach doiciméad ach taifead tinrimh.','Bíonn cuspóirí éagsúla ag doiciméid. Faigh amach cad a deir an ceann seo.',
   'Síniú mar go ráthaíonn sé go rachaidh mé abhaile láithreach.','Ní thugann síniú an ráthaíocht sin. Iarr míniú ar an doiciméad agus ar do roghanna.',
   'An abairt a lua agus soiléiriú, ceartúcháin agus comhairle a iarraidh.','D’ardaigh tú an fhadhb chruinnis sular dhearbhaigh tú an cuntas.'
  ],[
   'Cad a dhéanann tú nuair a cheistíonn Jamie an fhoclaíocht?','Tabhair deis an cuntas a léamh, a thuiscint agus a cheartú, le tacaíocht agus comhairle chuí. Ní réitíonn síniú imní faoi chruinneas.',
   'Sos a ghlacadh, an fhoclaíocht a sheiceáil agus soiléiriú, ceartú agus comhairle a éascú.','Ba chóir don chuntas an méid atá i gceist ag Jamie a léiriú go cruinn.',
   'Síniú a iarraidh anois agus gealladh gur féidir gach míthuiscint a réiteach níos déanaí.','Cuireann sé sin brú ar leanbh foclaíocht atá faoi dhíospóid a dhearbhú.'
  ])
 }},
 'public-fair-treatment':{title:'“Cén fáth ar roghnaíodh mise?”',description:'Tá imní ort gur imir ciníochas tionchar ar an gcóireáil. Foghlaim faoi fhianaise, tacaíocht agus gearáin.',nodes:{
  'fair-start':n('Eachtra a fhanann leat','Ceistíodh Amina, bean Dhubh Éireannach, ach níor labhraíodh le daoine eile in aice láimhe. Tá sí saor le himeacht agus mothaíonn sí gur roghnaíodh í go héagórach. Ní chinneann an cuntas gearr seo cúis ná dleathacht na teagmhála.',[
   'Cén tús atá úsáideach?','Is fiú éisteacht le himní faoi phróifíliú ciníoch. Taifeadann tuarascáil INAR/ICCL eispéiris pobail; ní féidir leis an eachtra fhicseanúil seo a chinneadh ar tharla idirdhealú nó gníomh neamhdhleathach.',
   'Glacadh leis go ráthaíonn freagra socair cóireáil chóir.','Ní rialaíonn d’iompar gníomhartha duine eile agus ní thugann sé leithscéal do mhíchóireáil.',
   'M’imní a ghlacadh dáiríre, fíricí a thaifeadadh agus tacaíocht a lorg.','Tugann sé spás do d’eispéireas gan a mhaíomh gur féidir leis an gcluiche an cheist dhlíthiúil a réiteach.',
   'Glacadh leis go gcaillim mo chearta má tá mé trína chéile.','Ní bhaineann mothúcháin do chearta díot agus ní thugann siad údar do mhíchóireáil.'
  ],[
   'Mar Gharda atá ag athbhreithniú na teagmhála, cad is gá a scrúdú?','Glac imní faoi roghnú agus cóireáil dáiríre. Scrúdaigh na forais agus an t-iompar; ná glac leis go gcruthaíonn imní idirdhealú ná nach bhfuil rud le scrúdú mar nár gabhadh duine.',
   'An roghnú, na forais agus an chóireáil a scrúdú agus éisteacht leis an imní.','Coinníonn tú cuntasacht oscailte agus an fhianaise á meas agat.',
   'An imní a dhíbhe mar gur ceadaíodh d’Amina imeacht.','Ní fhreagraíonn scaoileadh ceisteanna faoin teagmháil roimhe sin.'
  ]),
  'fair-record':n('Sula n-imíonn na sonraí as cuimhne','Tá Amina in áit shábháilte ag scríobh nóta pearsanta. Níl ainm an Gharda ar eolas aici. Déanann an Garda machnamh ar leith ar an taifead oifigiúil; ní fheiceann ceachtar ról nótaí príobháideacha an róil eile.',[
   'Cad atá úsáideach a thaifeadadh?','Taifead am, áit, focail, gníomhartha, finnéithe agus aon sonraí aitheantais atá agat. Coinnigh fianaise atá ann go sábháilte. Is féidir gearán a dhéanamh gan ainm an Gharda.',
   'Cuntas fíorasach, sonraí finnéithe agus eolas aitheantais atá ar fáil.','Ní gá taifead foirfe chun imní a ardú. Bí soiléir faoin méid atá ar eolas agat.',
   'Dada, mar nach féidir gearán a dhéanamh gan ainm an Gharda.','Is féidir le Fiosrú iarracht a dhéanamh an Garda a aithint má ghlactar le gearán lena imscrúdú.',
   'Sonraí a chumadh chun an cuntas a dhéanamh níos iomláine.','Tá cruinneas tábhachtach. Marcáil éiginnteacht seachas bearnaí a líonadh le tuairimí.'
  ],[
   'Cad ba chóir do do chuntas féin a chaomhnú?','Taifead na himeachtaí agus bunús na gcinntí go cruinn de réir na nósanna imeachta cuí. Scar breathnuithe ó léirmhínithe agus ná cuir sonraí feabhsaithe leis ina dhiaidh sin.',
   'Amanna, focail, forais agus gníomhartha ábhartha, agus éiginnteacht marcáilte.','Tacaíonn seicheamh fíorasach soiléir le scrúdú níos déanaí.',
   'Míniú feabhsaithe a fhágann éiginnteacht agus sonraí míchaoithiúla ar lár.','D’fhéadfadh athchruthú snasta an t-eolas a bhí ann i ndáiríre a cheilt.'
  ]),
  'fair-route':n('Dhá bhealach tuairiscithe','Aimsíonn Amina iReport agus Fiosrú agus measann sí a gcuspóirí éagsúla. Measann an Garda conas freagairt má chuirtear ceist faoi imní.',[
   'Cén cur síos atá cruinn?','Láimhseálann Fiosrú gearáin fhoirmiúla faoi iompar Gardaí aonair. Bailíonn iReport INAR tuairiscí faoi rún ar chiníochas. Ní chuireann tuairisc iReport gearán faoi bhráid Fiosrú go huathoibríoch.',
   'Tosaíonn tuairisc iReport gearán foirmiúil faoi iompar Gardaí go huathoibríoch.','Tá na córais ar leith. Úsáid próiseas Fiosrú don ghearán foirmiúil sin.',
   'Níl i Fiosrú ach ainm nua ar an stáisiún Gardaí áitiúil.','Is é Fiosrú Oifig neamhspleách an Ombudsman Póilíneachta; tháinig sé in áit GSOC in Aibreán 2025.',
   'Tá cuspóirí éagsúla acu; is féidir liom ceachtar acu nó an dá cheann a mheas.','Roghnaigh na bealaí cuí agus lorg comhairle faoi gach próiseas.'
  ],[
   'Cén t-eolas a bheadh cruinn agus cabhrach?','Pléann Fiosrú le gearáin faoi iompar Gardaí; tá cuspóir ar leith ag iReport maidir le ciníochas. Ná maígh go seolann córas amháin tuairisc chuig an gceann eile go huathoibríoch.',
   'Na bealaí éagsúla a mhíniú agus an t-eolas oifigiúil reatha a thaispeáint.','Tacaíonn treoir shoiléir le rogha eolasach gan toradh a ghealladh.',
   'A rá go gcruthaíonn iReport gearán foirmiúil Fiosrú go huathoibríoch.','Tá feidhmeanna éagsúla acu; bheadh an dearbhú sin míthreorach.'
  ]),
  'fair-deadline':n('Níl tú cinnte cathain gníomhú','Tá roinnt míonna caite ón teagmháil. Tá Amina ag smaoineamh ar ghearán foirmiúil anois. Pléann an dá ról le heolas cruinn faoi am.',[
   'Cad ba chóir duit a fhios faoi spriocdhátaí?','De ghnáth, caithfear gearán Fiosrú a dhéanamh laistigh de 12 mhí. D’fhéadfaí glacadh le gearán déanach ar chúis mhaith. Tá spriocdhátaí dá gcuid féin ag leigheasanna dlí eile.',
   'An próiseas a sheiceáil anois agus comhairle a lorg faoi mhoill nó spriocdhátaí eile.','Is féidir cinneadh eolasach a dhéanamh gan glacadh leis go bhfuil an teorainn chéanna ag gach bealach.',
   'Fanacht gan teorainn mar nach mbíonn spriocdhátaí ag gearáin.','De ghnáth, tá teorainn 12 mhí ann do ghearáin Fiosrú.',
   'Glacadh leis nach féidir gearán déanach a dhéanamh in aon chás.','Is féidir le Fiosrú cúis mhaith leis an moill a mheas. Seiceáil leo.'
  ],[
   'Cad a déarfá dá bhfiafrófaí an bhfuil sé ródhéanach?','Úsáid rialacha reatha Fiosrú. Is é 12 mhí an ghnáth-theorainn; d’fhéadfaí gearán déanach a ghlacadh ar chúis mhaith. Ná déan cinneadh inghlacthachta thar a cheann.',
   'An t-eolas reatha ar theorainneacha ama a thaispeáint agus ligean do Fiosrú an mhoill a mheas.','Tugann sé bealach iontaofa gan cinneadh gan bhunús a dhéanamh.',
   'A rá go gcailltear an cumas gearán a dhéanamh go huathoibríoch tar éis roinnt míonna.','Ní léiríonn sé sin an ghnáth-theorainn ná an fhéidearthacht cúis mhaith le moill a ghlacadh.'
  ])
 }}
});
Object.assign(gaContent,{
 'garda-street':{title:'Amhras ar an tsráid',description:'Féachann duine ar shiúl agus patról ag teacht. Scar an méid a chonaic tú ó na toimhdí a rinne tú.',nodes:{
  'street-start':n('Cad a tharraing d’aird?','Tá Alex, 24, in aice le siopa dúnta ag féachaint ar ghuthán. Féachann Alex ar shiúl agus Garda patróil ag teacht. Luadh gadaíochtaí i bhfaisnéisiú, ach níor tugadh cur síos ábhartha. Níl bagairt láithreach ná nasc sonrach le cion ann.',[
   'Mar Alex, cad a chabhródh leat an teagmháil a thuiscint?','Is féidir cuspóir na ceiste agus an bhfuil tú saor le himeacht a iarraidh. Ní chruthaíonn féachaint ar shiúl ná bheith in aice le siopa dúnta dualgas dlíthiúil fanacht ann féin.',
   'Fiafraí cén fáth a bhfuil an Garda ag teacht chugam agus an gá dom fanacht.','Lorgaíonn sé soiléireacht faoi chuspóir agus stádas na teagmhála.',
   'Glacadh leis go gcaithfidh mé cuntas a thabhairt ar an oíche ar fad gach uair a thagann Garda chugam.','Tá roinnt ceisteanna deonach; d’fhéadfadh cumhacht dhlíthiúil ar leith é sin a athrú. Soiléirigh an staid.'
  ],[
   'Cad a dhéanann tú leis an gcéad tuiscint seo?','Is spreagadh chun eolas a scrúdú í an chéad tuiscint. Ní bunús dlíthiúil léirithe le coinneáil nó cuardach í inti féin.',
   'Nasc sonrach le cion a sheiceáil sula gcinnim ar theagmháil.','Tugann sé deis an chéad léirmhíniú a thástáil gan gnáthiompar Alex a chur faoi cheist.',
   'Ceist oscailte a chur agus a rá go soiléir go bhfuil an comhrá deonach.','Teastaíonn cuspóir dlisteanach agus roghnú cóir freisin. Coinnigh an rogha imeachta fíor agus meas an bhfuil teagmháil ag teastáil ar chor ar bith.',
   'Éileamh go bhfanfadh Alex go dtí go bhfaighim amach an bhfuil an t-iompar neamhurchóideach.','Cuireann sé ualach ar Alex sula n-aithnítear cumhacht coinneála agus a coinníollacha. Déan athmheas ar an srian.'
  ]),
  'street-reset':n('Is féidir treo a athrú','Fiafraíonn Alex: “An gá dom fanacht?” Níor aithin an Garda cumhacht a éilíonn fanacht agus tuigeann sé go raibh cuma éigeantach ar an bhfoclaíocht roimhe seo.',[
   'Cén difríocht ba mhaith leat a shoiléiriú?','Fiafraigh faoin stádas dlíthiúil reatha; ní freagra iomlán í foclaíocht débhríoch roimhe seo.',
   'Fiafraí an bhfuil sé deonach agus an bhfuil mé saor le himeacht anois.','Díríonn sé ar fhreagra soiléir faoin staid reatha.',
   'Glacadh leis go bhfuil mé faoi ghabháil díreach mar go raibh an chaint daingean.','Teastaíonn soiléiriú; ní chruthaíonn an fhoclaíocht gabháil inti féin.'
  ],[
   'Conas a fhreagraíonn tú?','Is cuid de chinnteoireacht chuntasach é ceartú measúil. Ná cum údar le cinneadh díreach mar gur fhógair tú é cheana.',
   'A shoiléiriú go bhfuil Alex saor le himeacht agus an gá le fiosrú a athmheas.','Ceartaíonn tú stádas na teagmhála agus filleann tú ar an bhfianaise.',
   'A rá go dtiocfaidh deireadh leis nuair a chruthaíonn Alex nach bhfuil fadhb ann.','Tugann sé sin le fios go bhfuil srian ann gan an bunús dlíthiúil atá in easnamh.',
   'An t-iarratas céanna a dhéanamh níos béasaí gan a shoiléiriú an féidir imeacht.','Cuidíonn cúirtéis, ach ní réitíonn sí srian débhríoch nó gan bhunús.'
  ]),
  'street-enquiry':n('Rogha diúltú','Deir an Garda go bhfuil an fiosrú deonach agus Alex saor le himeacht. Diúltaíonn Alex an tráthnóna a phlé agus tosaíonn ag siúl ar shiúl. Níor athraigh aon fhíric eile.',[
   'Cad a chiallaíonn diúltú don chomhrá deonach seo?','Ní hionann diúltú d’fhiosrú deonach agus éileamh reachtúil bailí a dhiúltú. Ní thugann an scéal foras nua coinneála.',
   'Is féidir an comhrá deonach seo a dhiúltú; bheadh bunús dá chuid féin ag éileamh dleathach eile.','Scarann tú na fíricí reatha ó chás ina bhfuil ceanglas dlíthiúil.',
   'Cruthaíonn diúltú go huathoibríoch go bhfuil rud neamhdhleathach le ceilt agam.','Ní admháil éagóra é rogha a úsáid i bhfiosrú deonach.'
  ],[
   'Cad a athraíonn i do mheasúnú?','Ní sholáthraíonn diúltú d’fhiosrú atá deonach i ndáiríre na forais atá in easnamh. Teastaíonn coinníollacha reachtúla ar leith do dhualgais aitheantais.',
   'An diúltú a mheas mar an fhíric bhreise a údaraíonn cuardach.','Pionósaíonn sé an rogha dheonach agus ní aithníonn sé cumhacht chuardaigh fós.',
   'Ainm agus seoladh a éileamh mar ghnáthsheiceáil éigeantach.','Teastaíonn cumhacht ábhartha agus a coinníollacha; ní hé sin an gnáthfhreagra ar dhiúltú comhrá.',
   'Ligean d’Alex imeacht agus an difríocht idir diúltú agus fianaise a choinneáil.','Fanann an teagmháil ag teacht leis an stádas a mhínigh tú.'
  ]),
  'street-information':n('Míniú eile','Míníonn glantóir an tsiopa go bhfuil Alex ag fanacht le rothar a bhailiú tar éis seal oibre. Tagann an míniú leis an méid atá le feiceáil. Níl nasc le cion sonrach ann.',[
   'Conas ba chóir an t-eolas nua a thuiscint?','D’fhéadfadh míniú eile an teagmháil a shoiléiriú. Ní gá gach sonra de do shaol a chruthú chun toimhde gan bhunús a shárú.',
   'An míniú a aithint agus fiafraí an bhfuil ceanglas dleathach eile ann.','Is iad an stádas reatha agus na forais iarbhír na ceisteanna ábhartha.',
   'Glacadh leis go gcaithfidh mé gach cuid den tráthnóna a chruthú sula gceadaítear dom imeacht.','Níor bunaíodh ceanglas ginearálta den sórt sin ar na fíricí seo.'
  ],[
   'Cén chéad chinneadh comhréireach eile atá ann?','Ní gá cinnteacht faoi gach gné de shaol duine chun a chinneadh nach dtacaíonn an t-eolas le hidirghabháil éigeantach.',
   'Deireadh a chur leis an bhfiosrú; níl bunús sainaitheanta le coinneáil ná cuardach anseo.','Tá an míniú eile agus easpa naisc shonraigh tábhachtach. Fan oscailte d’eolas nua iarbhír.',
   'Leanúint le cuardach mar go bhféadfadh an míniú bheith réamhchleachtaithe.','Ní foras nua sonrach cuardaigh í an fhéidearthacht theoiriciúil go bhfuil míniú bréagach.',
   'Alex a choinneáil in aice láimhe go seiceálfar gach sonra den seal oibre.','Ní chruthaíonn féidearthacht éagóra gan réiteach cumhacht coinneála inti féin.'
  ]),
  'street-identity':n('Na fíricí céanna. Comhartha féiniúlachta eile.','Cuir dhá leagan i gcomparáid: Alex ina Éireannach Dubh i gceann amháin agus ina Éireannach Bán sa cheann eile. Tá aois, éadaí, áit, iompar agus eolas mar an gcéanna. Ní cuid de chur síos ábhartha ar amhrastach í ceachtar féiniúlacht.',[
   'Cad ba chóir fanacht mar an gcéanna do Alex?','Níor cheart go n-athródh caighdeáin dhlíthiúla ná cóireáil chóir de bharr comhartha féiniúlachta neamhábhartha. Cleachtadh foghlama é seo, ní diagnóis claonta.',
   'An tairseach idirghabhála agus an teideal ar chóireáil chóir.','Cuidíonn an chomparáid le hathrú gan bhunús i gcaighdeáin a aithint.',
   'Ba chóir go mbeadh dualgas níos mó neamhchiontacht a chruthú ar an bhféiniúlacht is lú aithne.','Ní chruthaíonn easpa taithí ar fhéiniúlacht dualgas dlíthiúil ar dhuine.'
  ],[
   'Cad ba chóir don chomparáid seo a athrú?','Spreagadh machnaimh í seo, ní tástáil shíceolaíoch. Scrúdaigh difríocht san amhras; ní fianaise bhreise faoi cheachtar duine í.',
   'An caighdeán céanna fianaise agus dlí a chur i bhfeidhm agus difríocht in intuition a scrúdú.','Scarann tú bunús an chinnidh ó chomhartha féiniúlachta. Ní dhéanann an cleachtadh diagnóis ar do chlaonadh.',
   'Tairseach níos ísle a úsáid don leagan nach bhfuil chomh heolach orm.','Ní ghlacann eolas ar fhéiniúlacht áit naisc shonraigh le fianaise.',
   'A chinneadh go gcruthaíonn an freagra céanna nach mbím claonta riamh.','Ní féidir le freagra hipitéiseach amháin iompar i bhfíorchásanna éagsúla a chruthú.'
  ])
 }},
 'garda-description':{title:'“Ag teacht leis an gcur síos”',description:'Éiríonn cur síos leathan níos sainiúla. Aithin sonraí a shainaithníonn duine agus sonraí a spreagann steiréitíopa.',nodes:{
  'description-start':n('Cur síos an-leathan','Tuairiscíonn glaoiteoir mála goidte agus déanann cur síos ar “bhean Dhubh i seaicéad dorcha”. Tá na gnéithe leathana sin ag Amina agus ag mórán daoine in aice láimhe. Níl sonraí aitheantais eile ná gníomh breathnaithe ann a nascann Amina leis an ngadaíocht.',[
   'Mar Amina, cad ba mhaith leat a shoiléiriú?','Fiafraigh cén fáth ar roghnaíodh thú, cén t-eolas sonrach atá ábhartha agus an bhfuil tú saor le himeacht. Ní shocraíonn cur síos leathan bunús idirghabhála éigeantaí ann féin.',
   'Fiafraí cad a nascann mé leis an tuairisc agus an fiosrú deonach é.','Lorgaíonn tú eolas sonrach agus míniú soiléir ar do stádas.',
   'Glacadh leis go gcaithfear gach duine leis na gnéithe leathana sin a chuardach.','Déileálann sé sin le cur síos ar ghrúpa mar chumhacht chuardaigh iomlán.'
  ],[
   'Cad í an chéad chéim is láidre?','Is féidir eolas cuma a bheith i gcur síos ábhartha. Tá cruinneas, iontaofacht, am agus nasc leis an eachtra tábhachtach; níor cheart go mbeadh meaitseáil leathanghrúpa ina riail roghnúcháin ghinearálta.',
   'Sonraí níos sainiúla a lorg agus am, áit agus treo taistil a sheiceáil.','Feabhsaíonn tú an t-eolas sula gceanglaíonn tú an líomhain le duine ar leith.',
   'Gach duine in aice láimhe leis an dá ghné sin a chuardach.','Measann sé catagóir leathan chiníoch mar nasc aonair leordhóthanach agus fágtar an chumhacht chuardaigh gan aithint.',
   'Gach eolas cuma a bhaint, fiú má tá cur síos sonrach ar fáil.','Ní gá fianaise aitheantais ábhartha a chaitheamh uait chun steiréitíopaí a sheachaint. Meas a cáilíocht agus a hábharthacht dhlíthiúil.'
  ]),
  'description-repair':n('Cuir an cuardach ginearálta ar sos','Fiafraíonn comhghleacaí cén chumhacht a d’údaródh an cuardach ginearálta beartaithe agus cén fáth ar roghnaíodh daoine ar leith. Tá an glaoiteoir ar fáil fós. Níor tugadh forais aonair nua.',[
   'Cad ba chóir don cheist faoi chumhacht dhlíthiúil a scrúdú?','Tá coinníollacha iarbhír agus bunús aonair na hidirghabhála tábhachtach. Ní thugann cóireáil chomhionann do ghrúpa iomlán údar le cuardach ginearálta.',
   'An bhfuil bunús sonrach dleathach le hidirghabháil liomsa.','Díríonn sé ar fhorais aonair seachas ballraíocht ghrúpa.',
   'An bhfuil go leor daoine eile á gcuardach ag an am céanna amháin.','Ní réitíonn cuardach níos leithne gan bhunús easpa foras aonair.'
  ],[
   'Conas a fheabhsaíonn tú an cinneadh?','Ní chruthaíonn ainmniú imscrúdaithe coinníollacha chun gach duine a chuardach. Fill ar fhíricí aonair agus ar an gcumhacht chuí.',
   'Gaireacht don chaifé a mheas mar chúis le gach duine sa chatagóir a chuardach.','Is comhthéacs í gaireacht; ní ghlacann sí áit naisc shonraigh agus cumhachta dleathaí go huathoibríoch.',
   'An cur síos iomlán a fháil agus an gá le hidirghabháil a athmheas.','Is féidir an gníomh beartaithe a athrú sula gcuireann sé isteach gan ghá.',
   'An roghnú céanna a choinneáil agus an tuairisc ghinearálta a thaifeadadh mar fhorais.','Ní éiríonn míniú lag níos aonaraí de bharr é a thaifeadadh.'
  ]),
  'description-detail':n('Sonra nach dtagann leis','Cuireann an glaoiteoir painéal buí sa seaicéad, rothar dearg agus imeacht i dtreo na habhann roinnt nóiméad roimhe leis an gcur síos. Níl painéal ná rothar ag Amina agus bhí sí sa chaifé i rith an ama sin.',[
   'Cad is féidir a lua faoin gcur síos nua?','Tá eolas a lagaíonn amhras le meas. Is féidir athmheas a iarraidh gan freagracht as cinneadh an Gharda a ghlacadh.',
   'Na sonraí nach dtagann liom a lua agus fiafraí an bhfuil mé saor le himeacht.','Aithníonn sé eolas ábhartha don athmheas.',
   'Glacadh leis nach féidir amhras a athrú tar éis é a rá.','Is féidir le heolas nua ábhartha bunús idirghabhála a athrú.'
  ],[
   'Conas a phléann tú leis an neamhréir?','Tabhair an aird chéanna d’eolas a lagaíonn do chéad tuiscint agus d’eolas a thacaíonn léi. Ná fág sonraí míchaoithiúla ar lár go ciúin.',
   'An chéad chonclúid a choinneáil mar go meaitseálann an chéad dá ghné fós.','Tugann sé sin níos mó meáchain don leid leathan ná don eolas idirdhealaitheach nua.',
   'Nasc Amina a athmheas agus fiosrúcháin a dhíriú ar an gcuntas níos iomláine.','Tá an neamhréir tábhachtach. Ní bhunaíonn an scéal foras chun Amina a chuardach.',
   'Iarraidh ar Amina a mhíniú cén fáth ar athraigh an cur síos sula gceadaítear imeacht.','Ní chuireann ceartú an ghlaoiteora an dualgas ar Amina rannpháirtíocht a bhréagnú.'
  ]),
  'description-power':n('Nuair atá an mheaitseáil níos láidre','Leagan ar leith: meaitseálann duine eile an cur síos níos iomláine, an treo agus an t-am, agus tugann finné iontaofa eolas sonrach eile. Imríonn tú an duine sin anseo. Ní athraíonn an lipéad róil ach ag an athrú follasach radhairc seo.',[
   'Cad atá réasúnach a iarraidh nuair atá an t-eolas níos sainiúla?','Is ceisteanna ar leith iad nasc fianaise níos láidre agus cumhacht dhlíthiúil. Tá cearta fós ag an duine agus is féidir míniú agus comhairle dlí a lorg.',
   'An chúis, an chumhacht agus an méid atá ag teastáil uaim a iarraidh.','Ní bhaineann tuairisc níos sainiúla an gá an gníomh beartaithe a thuiscint.',
   'Glacadh leis go mbaineann cur síos níos láidre gach ceart ceisteanna a chur.','Tá cearta agus cosaintí ábhartha fós nuair atá forais ann.'
  ],[
   'Cad atá le meas fós?','Ní chruthaíonn nasc fianaise níos láidre cumhacht chuardaigh uilíoch. Aithin an gníomh beartaithe agus coinníollacha dlí na hÉireann sula n-úsáidtear é.',
   'An chumhacht, a coinníollacha, cáilíocht an eolais agus freagra comhréireach.','Tá nasc sonrach ábhartha, ach teastaíonn bunús agus teorainneacha dlíthiúla don ghníomh fós.',
   'An meaitseálann eitneacht an duine cur síos an fhinné amháin.','Fágann sé sin fianaise idirdhealaitheach agus ceist ar leith an údaráis ar lár.',
   'Dada eile: údaraíonn cur síos mionsonraithe aon chuardach.','Ní ghlacann mionsonraí áit an reachta ná na gcosaintí a rialaíonn an gníomh.'
  ])
 }}
});
Object.assign(gaContent,{
 'garda-search':{title:'Forais le cuardach drugaí',description:'Ó imní doiléir go cás ar leith le forais shonracha. Scar údarás dlíthiúil, cumarsáid agus toradh.',nodes:{
  'search-start':n('“Tá gníomhaíocht drugaí anseo”','Luann faisnéisiú gníomhaíocht drugaí in aice le stad bus. Tá Niamh, 29, ag fanacht le mála agus cuma mhíshocair uirthi. Níl eolas sonrach faoi Niamh, druga ná malartú ann. Measann Garda alt 23.',[
   'Mar Niamh, cad a chabhródh leat cuardach beartaithe a thuiscint?','Iarr an chúis agus an chumhacht. Ní ghlacann bheith in áit ná cuma mhíshocair áit na gcoinníollacha reachtúla.',
   'Na forais shonracha agus an chumhacht dhlíthiúil a bhaineann liom a iarraidh.','Lorgaíonn sé bunús aonair an ghnímh.',
   'Glacadh leis gur féidir gach duine ag an stad bus seo a chuardach go huathoibríoch.','Ní chruthaíonn cur síos ginearálta ar áit cumhacht chuardaigh gan teorainn.'
  ],[
   'Cad is gá a scrúdú ar dtús?','Faoi alt 23, teastaíonn cúis réasúnach le hamhras go bhfuil druga rialaithe i seilbh duine contrártha don Acht. Ní chomhlíonann lipéad áite agus míshuaimhneas coitianta an tástáil go huathoibríoch.',
   'An faisnéisiú a mheas mar údarás chun gach duine ag an stad a chuardach.','Ní bhaineann imní faoin áit an gá an duine agus na coinníollacha reachtúla a mheas.',
   'Na fíricí sonracha agus an tairseach dhlíthiúil a aithint sula gcinntear cuardach.','Scarann sé comhthéacs úsáideach ó na forais aonair a theastaíonn.',
   'Toiliú a iarraidh ar bhealach a thugann le fios nach féidir an cuardach a sheachaint.','Ní réitíonn géilleadh do bhrú easpa foras bunaithe ná easpa bunús bailí cuardaigh.'
  ]),
  'search-check':n('“An bhfuil rogha agam?”','Fiafraíonn Niamh an bhfuil oscailt an mhála roghnach. Níor tháinig fianaise bhreise chun cinn. Sa leagan seo, níor bunaíodh bunús reachtúil ná bunús bailí eile le cuardach.',[
   'Cén difríocht atá tábhachtach do do fhreagra?','Soiléirigh an iarratas ar thoiliú é nó an maítear go bhfuil cuardach éigeantach faoi chumhacht dhleathach. Ní réitíonn brú ná géilleadh dealraitheach an difríocht.',
   'Fiafraí an bhfuil rogha agam agus cén bunús a mhaítear le cuardach éigeantach.','Lorgaíonn tú míniú soiléir gan glacadh leis go bhfuil toiliú uathoibríoch.',
   'Glacadh leis go bhfuil cuardach comhthoiliúil i gcónaí má mhothaím nach féidir diúltú.','Is cúis an bunús a scrúdú é mothú éigeantais, ní cruthúnas ar thoiliú saor.'
  ],[
   'Conas a fhreagraíonn tú?','Bí macánta faoin mbunús. Ná ceil éigeantas le rogha dhealraitheach ná cum forais as diúltú. Teastaíonn measúnú dlí agus beartais ar leith ar chuardaigh chomhthoiliúla.',
   'An staid a mhíniú agus gan dul ar aghaidh ar an mbunús reatha gan tacaíocht.','Seachnaíonn sé cuardach a chur i láthair mar rud dosheachanta gan bhunús bailí.',
   'A rá go bhfuil sé roghnach ach go gcruthóidh diúltú forais ann féin.','Athraíonn sé an rogha ina bagairt agus ní sholáthraíonn sé an fhianaise atá in easnamh.',
   'An cheist a fhágáil gan freagra ionas go n-osclófar an mála go deonach.','D’fhéadfadh tost faoi éigeantas bheith míthreorach. Tá cumarsáid shoiléir mar chuid den chinneadh.'
  ]),
  'search-specific':n('Cás ar leith le fianaise shonrach','Leagan ficseanúil ar leith: cloiseann Garda Niamh ag tairiscint paicéid mar chócaon agus feiceann sé malartú airgid. Don chleachtadh seo amháin, glactar leis go bhfuil na breathnuithe iontaofa, reatha agus leordhóthanach faoi alt 23. Níl bagairt phráinneach ann.',[
   'Sa leagan seo le cumhacht dhleathach sonraithe, cad atá ar fáil fós?','Is féidir míniú a iarraidh agus agóid a lua. Ní chuireann easpa toilithe cosc inti féin ar chuardach faoi chumhacht dhleathach. Seachain bac fisiciúil agus lorg comhairle faoi fhíoreachtra.',
   'Míniú a iarraidh agus mo sheasamh a lua gan bac fisiciúil.','Coinníonn sé an difríocht idir agóid agus bac ar an gcuardach dleathach sonraithe.',
   'Glacadh leis go gcealaíonn easpa toilithe gach cuardach reachtúil.','Ní bhraitheann cumhacht reachtúil bhailí ar an gcuardach a ghlaoch comhthoiliúil.'
  ],[
   'Cén chéad chéim eile is féidir a chosaint?','Nuair a chomhlíontar a choinníollacha, ceadaíonn alt 23 cuardach gan bharántas. Glactar leis na coinníollacha anseo chun idirghabháil le húdar a scrúdú chomh maith le cinn gan údar.',
   'Neamhaird a dhéanamh de na breathnuithe mar go gciallaíonn dúshlán claonta gan duine ar bith a chuardach riamh.','Áirítear le cóir caighdeán dleathach bunaithe ar fhianaise a chur i bhfeidhm go comhsheasmhach. Ní hé gach idirghabháil a sheachaint an cuspóir.',
   'A rá go bhfuil Niamh ciontach sula mínítear an cuardach.','Ní ciontú ná cinnteacht faoi dhruga mídhleathach iad forais chuardaigh.',
   'Alt 23 agus na breathnuithe sonracha a mhíniú agus gníomhú laistigh dá theorainneacha.','Faoi na toimhdí sonraithe, nascann sé an gníomh le cumhacht ábhartha agus fianaise aonair.'
  ]),
  'search-explain':n('Ceist faoi do chinneadh','Fiafraíonn Niamh cén fáth ar roghnaíodh í agus deir sí go raibh cuardaigh roimhe náireach. Tá na forais dhleathacha sonraithe fós ann. Níl bagairt ná bac fisiciúil ann.',[
   'Conas is féidir imní faoi chóireáil a ardú?','Ní bhaineann bunús dleathach cuardaigh tábhacht na cóireála measúla. Ní hionann ceist nó imní ó bhéal agus bac fisiciúil.',
   'An imní a mhíniú agus fiafraí conas a dhéanfar an cuardach go measúil.','Is féidir cóireáil a ardú ar leith ón easaontas faoin gcuardach.',
   'Glacadh leis go dtugann cumhacht dhlíthiúil leithscéal d’aon chóireáil náireach.','Ní bhaineann údarás cuardaigh an ceanglas ar leith maidir le cóireáil chuí.'
  ],[
   'Cad ba chóir an freagra a threorú?','Mínigh na forais shonracha, éist agus meas dínit agus príobháideachas, laistigh de theorainneacha na cumhachta. Ní chruthaíonn agóid ó bhéal cion eile inti féin.',
   'Éisteacht leis an imní, na forais a mhíniú agus céimeanna réasúnacha a ghlacadh chun dínit a chosaint.','Is freagrachtaí ar leith iad údarás dleathach agus cóireáil mheasúil; teastaíonn an dá rud.',
   'An cuardach a leathnú mar cheacht faoi chomhoibriú le Gardaí.','Ní údaraíonn easaontas cur isteach breise mar phionós.',
   'Gan míniú a thabhairt mar go bhfuil an cuardach dleathach cheana.','Ní dhéanann bunús bailí cumarsáid agus cuntasacht neamhthábhachtach.'
  ]),
  'search-result':n('Ní aimsítear aon rud','Ní aimsítear druga rialaithe. Tá an cuardach críochnaithe agus níl bunús coinneála eile tagtha chun cinn. Molann comhghleacaí go gcruthaíonn toradh folamh go huathoibríoch go raibh an cuardach neamhdhleathach.',[
   'Cad ba chóir do mheasúnú ina dhiaidh a threorú?','Meas na forais ag an am agus seoladh an chuardaigh. Ní chruthaíonn toradh folamh gníomh neamhdhleathach ná ní chuireann sé deireadh le himní dhlisteanach.',
   'Cuntas fíorasach ar na forais, am agus cóireáil a choinneáil le haghaidh comhairle nó athbhreithnithe.','Soláthraíonn sé eolas ábhartha chun an teagmháil a mheas.',
   'An toradh folamh amháin a úsáid mar bhreithiúnas dlíthiúil iomlán.','Ní ghlacann an toradh áit scrúdaithe ar an mbunús agus ar an iompar.'
  ],[
   'Cén measúnú is cúramaí?','Ní chinneann toradh amháin dleathacht: ní chuireann toradh folamh na forais roimhe ar neamhní go huathoibríoch, agus ní chruthaíonn aimsiú ruda forais a bhí in easnamh go cúlghabhálach.',
   'Niamh a choinneáil agus míniú eile ar an toradh folamh á lorg.','Tá críochnú an chuardaigh agus easpa bunús eile tábhachtach chun deireadh a chur leis an srian.',
   'Deireadh a chur leis an gcoinneáil, an toradh a thaifeadadh agus na forais agus an t-iompar a athbhreithniú.','Scarann tú an toradh ón tástáil dhlíthiúil roimhe agus coinníonn tú cuntas macánta.',
   'An taifead a bhaint mar nach bhfuil toradh folamh úsáideach.','Chuirfeadh eisiamh torthaí diúltacha athbhreithniú agus foghlaim as riocht.'
  ])
 }},
 'garda-communication':{title:'Nuair a mhíléitear iompar',description:'Is féidir le freagraí malla agus beagán teagmhála súl toimhdí a spreagadh. Scrúdaigh cumarsáid, cumhacht agus cóireáil chóir.',nodes:{
  'communication-start':n('“Tá cuma sheachantach orthu”','Cuireann Garda ceist ghinearálta ar Maya, 34, faoi thuairisc áitiúil. Féachann Maya síos, tógann sí am le freagairt agus iarrann sí athrá. Níl fianaise shonrach a nascann í le cion. Glaonn comhghleacaí iompar seachantach air.',[
   'Mar Maya, cad a chabhródh leat páirt a ghlacadh le soiléireacht?','Is féidir athrá nó míniú agus soiléiriú ar do stádas a iarraidh. Ní admháil éagóra é stíl chumarsáide.',
   'Ceist shoiléir amháin ag an am a iarraidh agus fiafraí an gá dom fanacht.','Aithníonn sé an tacaíocht agus an stádas atá ag teastáil.',
   'Glacadh leis go gcaithfidh mé freagairt ar aon luas chun mo chearta a choinneáil.','Ní bhaineann gá le ham nó soiléiriú do chearta díot.'
  ],[
   'Cad a fheabhsódh an measúnú?','Ní diagnóis ná cruthúnas bréaga í difríocht chumarsáide. Dírigh ar an eolas iarbhír agus fiafraigh cad a chabhródh leis an duine tuiscint agus freagairt.',
   'An cheist a athrá níos géire chun a thástáil an bhfuil an mhoill d’aon ghnó.','D’fhéadfadh brú iompar a athrú gan a chruthú go raibh údar leis an amhras roimhe.',
   'An mhoill a thaifeadadh mar fhianaise cheilte sna forais chuardaigh.','Athraíonn sé léirmhíniú cumarsáide ina líomhain nár tástáladh.',
   'Ceist shoiléir amháin a chur, am a thabhairt agus tacaíocht chumarsáide a mheas.','Lorgaíonn sé eolas úsáideach gan stíl chumarsáide a chomhionannú le ciontacht.'
  ]),
  'communication-repair':n('Tá an teagmháil ag éirí níos deacra','De réir mar a éiríonn na ceisteanna níos tapa, éiríonn Maya níos ciúine. Níl eolas nua faoi chion ná bagairt phráinneach sábháilteachta ann.',[
   'Cad is féidir leat a iarraidh anois?','Is iarratas dlisteanach é am nó cumarsáid níos soiléire a iarraidh. Ní chuireann sé freagracht as léirmhíniú gan bhunús duine eile ort.',
   'Iarraidh ar an nGarda moilliú agus cuspóir agus stádas na gceisteanna a mhíniú.','Déanann sé riachtanas cumarsáide sonrach soiléir.',
   'Glacadh leis go gcruthaíonn éirí ciúin cumhacht nua coinneála.','Níor chruthaigh tost sa scéal seo bunús aonair le gníomh éigeantach.'
  ],[
   'Cad is gá a athrú?','Níor cheart freagra ar an teagmháil féin a mheas go huathoibríoch mar dhearbhú ar an amhras bunaidh. Athmheas an luas, an fhoclaíocht agus an cuspóir.',
   'An brú a laghdú, an cheist a shoiléiriú agus an gá le teagmháil bhreise a athmheas.','Is féidir an teagmháil a athrú agus aird a thabhairt ar fhianaise nua iarbhír fós.',
   'An tost méadaithe a mheas mar dhearbhú neamhspleách mímhacántachta.','Tharla sé faoi bhrú na teagmhála agus tá míniúcháin eile indéanta.',
   'Éileamh go míneodh Maya a deacracht chumarsáide sula n-athmheastar cuardach.','Cuireann sé measúnú cóir ag brath ar riocht pearsanta a chruthú.'
  ]),
  'communication-clarify':n('Iarratas ar am','Deir Maya: “Tá mé uathach. Cuir ceist amháin ag an am, le do thoil.” Tá an comhrá deonach. Fiafraíonn sí an gá leanúint. Níl forais shonracha le hidirghabháil éigeantach tagtha chun cinn.',[
   'Cad is féidir leat a chinneadh sa chomhrá deonach seo?','Is féidir tacaíocht chumarsáide a iarraidh agus a shoiléiriú an leanfaidh tú. Ní dhéanann nochtadh riachtanais comhrá éigeantach.',
   'An t-oiriúnú a iarraidh agus cinneadh a dhéanamh tar éis a shoiléiriú go bhfuil mé saor le himeacht.','Is féidir meas a léiriú ar an iarratas agus ar an stádas deonach araon.',
   'Glacadh leis go gcuireann nochtadh uathachais dualgas orm gach ceist a fhreagairt.','Ní chruthaíonn an nochtadh dualgas leanúint le fiosrú deonach.'
  ],[
   'Cén freagra is fearr ar na fíricí seo?','Tabhair meas ar an riachtanas cumarsáide agus ar stádas iarbhír na teagmhála. Ná glac le héagumas, ciontacht nó gá coinneála de bharr diagnóise.',
   'An luas tapa céanna a úsáid chun cóireáil chomhionann a léiriú.','D’fhéadfadh oiriúnú cuí bheith riachtanach don chóir; ní bhíonn cur chuige comhionann inrochtana i gcónaí.',
   'A mhíniú go bhfuil Maya saor le himeacht, teanga shoiléir a úsáid agus deireadh a chur le ceisteanna gan ghá.','Tugann tú meas ar an oiriúnú gan é a dhéanamh ina chúis coinneála.',
   'Maya a choinneáil sa stáisiún ar mhaithe le suaimhneas mar gur luadh diagnóis.','Ní chruthaíonn an nochtadh cumhacht coinneála ná riachtanas cosanta ann féin.'
  ]),
  'communication-review':n('Cad atá le plé san athbhreithniú?','Tá an teagmháil thart. Athbhreithníonn an Garda an chumarsáid le maoirseoir. Déanann Maya machnamh ar leith ar a heispéireas agus ar chabhair; níl sí sa chomhrá príobháideach Gardaí.',[
   'Cad a d’fhéadfadh cuntas úsáideach ar d’eispéireas a aithint?','Déan cur síos ar na ceisteanna, an luas, na míniúcháin agus na riachtanais iarbhír. Ná glac le cumarsáid duine amháin mar léiriú ar gach duine uathach.',
   'Na míniúcháin agus oiriúnuithe a chabhraigh nó a bhí in easnamh.','Is féidir le breathnuithe sonracha tacú le foghlaim nó imní a ardaítear níos déanaí.',
   'Riail go ndéanann gach duine uathach cumarsáid ar an mbealach céanna.','Ba chóir tacaíocht a chur in oiriúint don duine, gan steiréitíopa nua a chur ina háit.'
  ],[
   'Cad é an pointe foghlama is úsáidí?','Éist le riachtanais, meas míniúcháin eile agus scar breathnuithe ó thoimhdí. Níor cheart seicliosta nua lipéadaithe a chruthú as cleachtadh foghlama.',
   'Glacadh leis go bhfuil gach duine a sheachnaíonn teagmháil súl uathach.','Cuireann sé tátal gan bhunús amháin in áit ceann eile.',
   'Glacadh leis go gcuireann freagraí socra líofa cion as an áireamh.','Ní chruthaíonn stíl chumarsáide ciontacht ná neamhchiontacht.',
   'Soiléireacht, luas, stádas agus fianaise a athbhreithniú ar leith ó stíl chumarsáide.','Tugann sé próiseas cinnteoireachta in-athúsáidte agus spás do dhifríochtaí aonair.'
  ])
 }}
});
Object.assign(gaContent,{
 'garda-young-person':{title:'Duine óg, toimhde faoi dhuine fásta',description:'Forluíonn cuma, aois agus ballraíocht ghrúpa. Scrúdaigh toimhdí faoi bhagairt agus cúram.',nodes:{
  'young-start':n('“Sean go leor chun ciall a bheith aige”','Tá Jamie, Éireannach Dubh ard atá 16, ag fanacht le bus le beirt chairde. Tá a aois ar eolas ag an nGarda. Níl iompar bagrach ná nasc le cion tuairiscithe. Glacann comhghleacaí leis gur duine fásta é agus molann cuardach ar an ngrúpa.',[
   'Mar Jamie, cé na fíricí ba mhaith leat a choinneáil san áireamh?','Tá d’aois iarbhír agus forais aonair tábhachtach. Ní chruthaíonn airde ná bheith le cairde cumhacht chuardaigh ann féin.',
   'M’aois, cúis na teagmhála agus an mbaineann ceanglas dlíthiúil liom.','Is fíricí agus ceisteanna ábhartha iad faoin teagmháil reatha.',
   'Glacadh leis go mbaineann m’airde ábharthacht de bheith 16.','Ní athraíonn cuma an aois atá ar eolas.'
  ],[
   'Cad ba chóir do fhreagra a threorú?','Ná cuir tuiscint bunaithe ar chuma in áit aoise atá ar eolas. Ní bhunaíonn bheith i ngrúpa forais aonair chuardaigh go huathoibríoch.',
   'An aois atá ar eolas a úsáid agus iompar iarbhír gach duine agus aon chumhacht chuí a mheas.','Coinníonn tú an fhíric ábhartha agus seachnaíonn tú líomhain aonair a dhéanamh den ghrúpa.',
   'Caitheamh le Jamie mar dhuine fásta mar gheall ar a airde.','Is eolas níos láidre í an aois atá ar eolas ná an tuiscint.',
   'An grúpa ar fad a chuardach ionas nach mothóidh duine roghnaithe.','Ní dhéanann gníomh gan bhunús a leathnú níos córa ná níos dleathaí é.'
  ]),
  'young-contact':n('“Cén fáth gur sinne i gcónaí?”','Deir Jamie gur ceistíodh an grúpa roinnt uaireanta ag an stad céanna. Tá frustrachas ina ghuth ach níl sé bagrach. Níl fianaise shonrach ar chion fós.',[
   'Conas is féidir d’imní a thuiscint?','Ní admháil chiontachta é frustrachas faoi theagmháil arís agus arís eile. Is féidir cuspóir agus stádas na teagmhála seo a iarraidh agus tacaíocht a mheas ina dhiaidh.',
   'An t-eispéireas athfhillteach a mhíniú agus fiafraí cén fáth atá an teagmháil seo ag tarlú.','Aithníonn sé an imní agus lorgaíonn sé míniú soiléir.',
   'Glacadh leis go soláthraíonn frustrachas forais chuardaigh go huathoibríoch.','Ní athraíonn na fíricí sonraithe frustrachas ina chumhacht chuardaigh.'
  ],[
   'Cén freagra cuiditheach atá ann?','D’fhéadfadh frustrachas teagmháil athfhillteach a léiriú. Éist go cóir gan é a mheas mar chruthúnas éagóra ná mar chuntas iomlán ar gach eachtra roimhe.',
   'An frustrachas a mheas mar údar leordhóthanach don chuardach beartaithe.','Ní sholáthraíonn imní ó bhéal na forais atá in easnamh.',
   'Éisteacht, cuspóir agus stádas na teagmhála a mhíniú agus idirghabháil gan ghá a sheachaint.','Aithníonn sé an imní agus coinníonn sé an cinneadh ceangailte leis an eolas iarbhír.',
   'Gealladh nach labhrófar leis an ngrúpa arís in aon chúinse.','Ní féidir teagmhálacha amach anseo a ráthú. Mínigh an cinneadh agus na caighdeáin reatha go macánta.'
  ]),
  'young-review':n('Comparáid féiniúlachta','Cuir na fíricí céanna i gcomparáid le Jamie ina Éireannach Bán atá 16. Tá aois, éadaí, cairde, focail agus iompar mar an gcéanna. Ní cuid de chur síos ábhartha ar amhrastach í an fhéiniúlacht.',[
   'Cad ba chóir bheith comhsheasmhach don dá leagan?','Tá an tairseach dhlíthiúil, aithint na haoise iarbhír agus cóireáil chóir ábhartha sa dá leagan.',
   'An caighdeán dlíthiúil céanna agus cóireáil oiriúnach don aois.','Tástálann an chomparáid athrú sa réasúnaíocht agus na fíricí ábhartha seasta.',
   'Dualgais éagsúla neamhchiontacht a chruthú de réir féiniúlachta.','Ní chruthaíonn féiniúlacht amháin an dualgas sin.'
  ],[
   'Cad ba chóir fanacht comhsheasmhach?','Úsáid an tairseach chéanna idirghabhála agus freagair do riachtanais an duine. Tacaíonn an cleachtadh le machnamh; ní chruthaíonn sé go bhfuil foghlaimeoir saor ó chlaonadh.',
   'An caighdeán céanna fianaise agus dlí, le cumarsáid oiriúnach don aois sa dá leagan.','Baineann comhsheasmhacht le forais agus cóireáil, ní le maíomh go bhfuil eispéiris daoine comhionann.',
   'Amhras níos airde faoin bhféiniúlacht is lú a chastar ar an bhfoireann.','Ní nasc sonrach leis an eachtra í easpa taithí.',
   'An toradh amháin: chruthódh líon comhionann cuardach cóir.','Ní chruthaíonn iomláin chomhionanna cáilíocht cinntí aonair ná cóireála.'
  ])
 }},
 'garda-colleague':{title:'“Tá aithne againn ar an teaghlach sin”',description:'Is féidir le heolas áitiúil agus muinín foirne toimhdí gan tástáil a iompar. Cleachtaigh ceistiú cuiditheach.',nodes:{
  'colleague-start':n('Sloinne aithnidiúil','Tá Patrick, 35, Taistealaí Éireannach, ag díluchtú uirlisí le haghaidh deisiúcháin sceidealaithe. Aithníonn comhghleacaí an sloinne agus luann trioblóid leis an teaghlach roimhe. Níl eolas a nascann Patrick ná na huirlisí le cion.',[
   'Mar Patrick, cad a shoiléireodh an idirghabháil bheartaithe?','Iarr an chúis aonair agus an bunús dlíthiúil. Níl freagracht ort iompar teaghlach nó pobal iomlán a chruthú.',
   'Fiafraí cén t-eolas reatha a bhaineann liom agus an bhfuil an cuardach éigeantach.','Díríonn sé ar an gcás aonair.',
   'Glacadh leis gur cumhacht chuardaigh uathoibríoch é clú teaghlaigh.','Ní bhunaíonn ceangal le grúpa forais aonair.'
  ],[
   'Conas a phléann tú le muinín an chomhghleacaí?','Ní chruthaíonn clú teaghlaigh nó pobail cad a rinne an duine seo. Scrúdaigh an t-eolas sonrach agus a ábharthacht.',
   'Taithí an chomhghleacaí a mheas mar fhorais leordhóthanacha cuardaigh.','Is féidir le taithí ceisteanna a spreagadh, ach ní ghlacann sí áit fíricí aonair agus údaráis dhleathaigh.',
   'Gach eolas áitiúil a dhiúltú gan seiceáil an bhfuil cuid de sonrach agus reatha.','D’fhéadfadh eolas úsáideach a bheith ann. Meas é seachas glacadh leis nó é a dhiúltú de réir a fhoinse amháin.',
   'Eolas sonrach reatha a nascann Patrick leis an gcion amhrasta a iarraidh.','Tástálann sé ábharthacht agus ceadaíonn sé ceistiú gairmiúil gan an comhghleacaí mar dhuine a dhíbhe.'
  ]),
  'colleague-pressure':n('“Seas liom”','Deir Garda go mbaineann ceistiú an chuardaigh bheartaithe an bonn den fhoireann. Ní thugtar fíricí nua. Fiafraíonn Patrick an bhfuil an cuardach éigeantach.',[
   'Cad atá tábhachtach beag beann ar easaontas na nGardaí?','Is é an bunús dlíthiúil agus na ceanglais iarbhír atá ábhartha. Ní ghlacann céim ná aontú foirne áit choinníollacha cumhachta.',
   'Míniú soiléir ar an gcumhacht agus ar an méid atá ag teastáil uaim a iarraidh.','Lorgaíonn sé soiléireacht gan aontú idir Gardaí a mheas mar thástáil dhlíthiúil.',
   'Glacadh leis go bhfuil an cuardach dleathach má aontaíonn an bheirt sa deireadh.','Ní bhunaíonn aontú amháin údarás dlíthiúil.'
  ],[
   'Cén freagra gairmiúil atá ann?','Áirítear le tacaíocht do chomhghleacaithe imní faoi úsáid cumhachta gan bhunús a ardú. Ní fianaise í guth sinsearach nó muiníneach ann féin.',
   'Dul ar aghaidh anois agus na forais atá in easnamh a ardú tar éis an chuardaigh.','Ceadaíonn sé cur isteach sula réitítear an imní.',
   'An imní a lua go soiléir, an chumhacht a shoiléiriú agus tacaíocht mhaoirseachta a lorg mura réitítear í.','Díríonn tú ar an gcinneadh agus úsáideann tú tacaíocht gan céim a mheas mar bhunús dlíthiúil.',
   'A thaifeadadh gurbh é cinneadh an chomhghleacaí é agus nach gá dom gníomhú tuilleadh.','Ní réitíonn sannadh an chinnidh do fhreagracht féin sa teagmháil.'
  ]),
  'colleague-specific':n('Cad a sheasann tar éis scrúdú?','Bhain an eachtra roimhe le duine eile roinnt blianta ó shin. Deimhníonn custaiméir an deisiúchán sceidealaithe. Níl cion reatha nasctha le Patrick, cé go bhfuil Garda fós míshuaimhneach.',[
   'Cad atá réasúnach a iarraidh faoin teagmháil leanúnach?','Tá fíricí reatha aonair tábhachtach. Ní chuireann míshuaimhneas leanúnach dualgas ort líomhain oidhreachta faoi ghrúpa a bhréagnú.',
   'Fiafraí an bhfuil mé saor leanúint leis an deisiúchán agus cé na forais reatha atá ann.','Díríonn sé ar an staid anois.',
   'Glacadh leis go gcaithfidh mé a chruthú go bhfuil gach gaol géilliúil don dlí sula n-imím.','Ní hé an teaghlach iomlán an tástáil dhlíthiúil don teagmháil seo.'
  ],[
   'Cad ba chóir tarlú don chuardach beartaithe?','Níor cheart ceangal stairiúil a chur in áit bunúis reatha aonair. Meas an fhianaise reatha, lena n-áirítear eolas a lagaíonn an moladh.',
   'Gan cuardach a dhéanamh ar na fíricí reatha; an cinneadh a mhíniú agus an toimhde a phlé leis an bhfoireann.','Freagraíonn tú don chás aonair agus coinníonn tú deis foghlama níos leithne.',
   'Na huirlisí a chuardach chun míshuaimhneas an chomhghleacaí a réiteach.','Ní fíric nua a nascann uirlisí le cion ná cumhacht chuardaigh é míshuaimhneas.',
   'Iarraidh ar Patrick a chruthú go bhfuil an teaghlach iomlán géilliúil don dlí anois.','Ní hé freagracht as grúpa an tástáil don teagmháil aonair.'
  ]),
  'colleague-review':n('Athbhreithniú úsáideach foirne','Tá an teagmháil thart. Measann Gardaí athbhreithniú foirne. Measann Patrick ar leith an roinnfidh sé a eispéireas agus conas; ní chiallaíonn sé sin gur ghlac sé páirt ná gur thoiligh sé le húsáid inaitheanta san oiliúint.',[
   'Cad a thacódh le rogha eolasach faoi obair leantach?','Is féidir tacaíocht nó eolas faoi ghearáin a lorg agus cinneadh a dhéanamh faoi rannchuidiú le foghlaim. Ní gá d’aitheantas ná do theaghlach a nochtadh i sampla poiblí.',
   'Mo chuntas fíorasach féin a choinneáil agus bealaí tacaíochta, gearáin nó aiseolais dheonaigh a mheas.','Is féidir bealach a roghnú gan gealltanas faoi thoradh ná nochtadh poiblí.',
   'Glacadh leis go gceadaíonn cuspóir oideachais sonraí mo theaghlaigh a fhoilsiú.','Ní bhaineann oiliúint príobháideachas ná láimhseáil chuí eolais.'
  ],[
   'Cén obair leantach atá úsáideach?','Athbhreithnigh an cinneadh aonair agus an teanga nó na nósanna a mhúnlaigh é. Is féidir le tuairimí pobail dochar nach léir sna taifid a aithint.',
   'An cheist a mheas réitithe mar nár tharla cuardach sa deireadh.','Tá an ceartú láithreach tábhachtach, ach tá an toimhde athfhillteach le scrúdú fós.',
   'Foghlaim anaithnidithe a úsáid, forais a athbhreithniú agus ionchur cuí ón bpobal a lorg.','Is féidir feabhas sonrach ar fhaisnéisiú agus maoirseacht a dhéanamh den teagmháil.',
   'Teaghlach Patrick a ainmniú go poiblí san oiliúint chun réaltacht a léiriú.','Ní gá daoine inaitheanta a nochtadh le foghlaim. Úsáid ábhar ficseanúil nó anaithnidithe go cuí.'
  ])
 }},
 'garda-new-evidence':{title:'Nuair a athraíonn na fíricí',description:'Tá idirghabháil fógartha agat. Lagaíonn eolas nua an bunús. Cinn cad atá le hathrú agus le taifeadadh.',nodes:{
  'update-start':n('D’fhógair tú cuardach cheana','Don chleachtadh seo, bhí bunús dleathach leis an gcuardach bunaidh ar Daniel, 32. Sula dtosaíonn sé, ceartaíonn an fhoinse earráid thábhachtach aitheantais agus imíonn an bunús. Níl foras eile ná bagairt phráinneach ann.',[
   'Mar Daniel, cad is féidir a iarraidh faoin gceartú?','Ba chóir gníomh beartaithe a athmheas nuair a athraíonn eolas tábhachtach. Ní sholáthraíonn fógairt cuardaigh bunús dlíthiúil leanúnach inti féin.',
   'Fiafraí an stopfaidh an cuardach de bharr an cheartaithe agus an bhfuil mé saor le himeacht.','Lorgaíonn sé éifeacht phraiticiúil an athmheasa.',
   'Glacadh leis go gcaithfear an cuardach a chríochnú díreach mar gur fógraíodh é.','Tá an bunús reatha tábhachtach, lena n-áirítear an ceartú roimh an gcuardach.'
  ],[
   'Conas a fhreagraíonn tú don athrú?','Caithfidh an cinneadh freagairt don eolas atá ar fáil anois. Ní gá gníomh fógartha a chríochnú nuair atá a bhunús imithe.',
   'Sos a ghlacadh, an bunús a athmheas agus gan leanúint leis an gcuardach ar na fíricí seo.','Athraíonn tú an cinneadh seachas an gealltanas roimhe a chosaint.',
   'Cuardach gearr a dhéanamh sula meastar an ceartú.','Teastaíonn bunús bailí fiú do chur isteach gearr; tá an ceartú ábhartha sula dtosaítear.',
   'Iarraidh ar Daniel an líomhain cheartaithe a bhréagnú sula gcealaítear.','Ní réitíonn an t-ualach a aistriú go Daniel easpa bunúis reatha.'
  ]),
  'update-repair':n('Iarrann comhghleacaí athbhreithniú','Tugann comhghleacaí faoi deara gur tháinig an ceartú roimh an gcuardach. Tá an staid socair agus is féidir an gníomh beartaithe a stopadh fós.',[
   'Cad atá ábhartha do do stádas fós?','Caithfear an ceartú a mheas agus é in ann tionchar a imirt fós. Ní bhunaíonn mian cuma chomhsheasmhach a bheith ann údarás dlíthiúil.',
   'An cinneadh nua a iarraidh agus fiafraí an bhfuil ceanglas reatha fanacht.','Lorgaíonn sé freagra soiléir ar an eolas ceartaithe.',
   'Glacadh leis gur féidir náire a sheachaint in áit foras cuardaigh.','Ní thugann cuma an bunús dlíthiúil atá in easnamh.'
  ],[
   'Cén freagra a fheabhsaíonn an cinneadh?','Tá athbhreithniú mar chuid de bhreithiúnas gairmiúil. Níor cheart imní faoi neamhsheasmhacht dealraitheach an fhianaise a chur ar leataobh.',
   'Leanúint chun freagra comhsheasmhach Gardaí a thaispeáint don phobal.','Ní hionann cloí le plean gan bhunús agus cloí leis an dlí agus leis an bhfianaise.',
   'An cheist a mheas mídhílis agus fanacht go dtí an t-athbhreithniú chun athmheas.','Meas ceartú láithreach ábhartha agus é in ann an gníomh a athrú fós.',
   'Glacadh leis an gceartú agus an cuardach a stopadh ar na fíricí seo.','Is féidir le hathrú treo cur isteach inseachanta a chosc.'
  ]),
  'update-explain':n('Mínigh cad a d’athraigh','Cinneann an Garda gan dul ar aghaidh. Fiafraíonn Daniel cén fáth ar fógraíodh an cuardach ar dtús.',[
   'Cén míniú is soiléire ar an athrú?','Ba chóir idirdhealú a dhéanamh idir an t-eolas bunaidh, an ceartú agus an stádas reatha. Ní gá gach ceist dhlíthiúil fhéideartha a réiteach.',
   'Cad a ceartaíodh, cén fáth nach leanfar leis an gcuardach agus an bhfuil mé saor le himeacht.','Déanann na pointí sin an t-athrú intuigthe.',
   'Maíomh go gcuireann cealú gach imní faoin teagmháil as an áireamh go huathoibríoch.','Ní réamhchinneann stopadh an ghnímh gach ceist faoin teagmháil roimhe.'
  ],[
   'Cén freagra is soiléire?','Mínigh an t-athrú ábhartha go macánta agus soiléirigh an stádas reatha. Ná geall ná déan cinntí dlíthiúla thar an méid is féidir a bhunú.',
   'A mhíniú gur ceartaíodh eolas, nach leanfar leis an gcuardach agus go bhfuil Daniel saor le himeacht.','Déanann sé an t-athrú agus deireadh an tsriain intuigthe.',
   'A rá gur críochnaíodh an cuardach go rathúil agus nach bhfuil aon rud eile le plé.','Is cur síos mícheart é sin agus cuireann sé bac ar chuntasacht.',
   'Gealladh go gcruthaíonn an ceartú nach bhféadfaí aon chuid den teagmháil a cheistiú riamh.','Ní féidir gach gearán ná ceist dhlíthiúil fhéideartha a chinneadh leis an dearbhú sin.'
  ]),
  'update-record':n('Tá an taifead tábhachtach freisin','Taifeadann an Garda an teagmháil níos déanaí. D’fhéadfadh Daniel nóta pearsanta ar leith a dhéanamh. Bhí an t-eolas bunaidh agus an ceartú araon ábhartha; níor tharla cuardach.',[
   'Cad ba chóir a bheith soiléir i do nóta?','Scar an rud a beartaíodh ón rud a tharla agus taifead am an cheartaithe chomh cruinn agus is féidir.',
   'An míniú bunaidh, an ceartú, an t-am agus nár lean an cuardach ar aghaidh.','Cuidíonn seicheamh fíorasach le comhairle nó athbhreithniú níos déanaí.',
   'Cur síos ar thoradh cuardaigh folamh cé nár tharla cuardach.','Is imeachtaí éagsúla iad cuardach cealaithe agus cuardach críochnaithe gan toradh.'
  ],[
   'Cad ba chóir don chuntas a chaomhnú?','Scar an t-eolas a bhí ar fáil roimh an gcinneadh ón eolas a fuarthas ina dhiaidh. Taifead athrú treo go macánta; ná cum forais go cúlghabhálach.',
   'An t-eolas bunaidh amháin mar go ndéanann ceartú an taifead casta.','Cheilfeadh fágáil an cheartaithe ar lár cuid thábhachtach den phróiseas.',
   'An bunús bunaidh, an ceartú, an t-am, an gníomh agus an chúis leis an athrú.','Tacaíonn sé le scrúdú fiúntach seachas scéal slachtaithe.',
   'A rá amháin nár aimsíodh aon rud, cé nár tharla cuardach.','Is imeachtaí éagsúla iad gan cuardach agus cuardach gan toradh; ná measc iad.'
  ])
 }},
 'garda-supervision':{title:'Cad a fhágann na huimhreacha ar lár',description:'Tá rátaí aimsithe comhionanna suaimhneach. Scrúdaigh roghnú, patróil agus an méid is féidir le toradh oiliúna a léiriú.',nodes:{
  'supervision-start':n('Painéal a bhfuil cuma shuaimhneach air','Úsáideann athbhreithniú ficseanúil sonraí sintéiseacha: Grúpa A, 60 cuardach agus 12 aimsiú; Grúpa B, 15 chuardach agus 3 aimsiú. Is é 20% an dá ráta. Ní fios nochtadh do phatróil, imscaradh, forais aonair ná cóireáil. Is iad na róil sáirsint maoirseachta agus duine den phobal mar athbhreithneoir pobail.',[
   'Mar athbhreithneoir pobail, cad is féidir a bhaint as an tábla?','Ní bhunaíonn rátaí aimsithe comhionanna cóir, agus ní shocraíonn comhairimh éagsúla cúis gach cinnidh. Aithin an t-eolas atá in easnamh sula ndéanann tú maíomh níos láidre.',
   'Fiafraí faoi roghnú, forais aonair, imscaradh agus cóireáil.','Aithníonn na ceisteanna sin an méid nach réitíonn an tábla.',
   'Na céatadáin amháin a mheas mar chruthúnas go raibh gach teagmháil cóir.','Teastaíonn scrúdú ar leith ar an sampla cuardaithe agus ar sheoladh na dteagmhálacha.'
  ],[
   'Cad is féidir a chinneadh faoin gcóir?','Ní chruthaíonn rátaí aimsithe comhionanna amháin roghnú ná cóireáil chóir. Teastaíonn fiosrú cúramach faoi dhifríochtaí; ní dhéanann an tábla diagnóis claonta ar gach Garda ach oiread.',
   'Cruthaíonn na rátaí comhionanna go raibh na cinntí cuardaigh chomh cóir céanna.','Fágann sé ar lár conas a roghnaíodh daoine agus conas a rinneadh na cuardaigh.',
   'Cruthaíonn na hiomláin éagsúla go raibh gach cinneadh faoi Ghrúpa A idirdhealaitheach.','Ardaíonn na figiúirí ceisteanna ach ní chinneann siad fíricí ná cúis gach teagmhála.',
   'Forais aonair, roghnú agus imscaradh a athbhreithniú sula mbaintear conclúid.','Aithníonn tú teorainneacha an tábla agus seachnaíonn tú suaimhneas nó diagnóis gan bhunús.'
  ]),
  'supervision-deployment':n('Cá seoltar patróil','Faigheann an t-athbhreithniú níos mó ama patróil i gceantar amháin agus béim ar líon cuardach mar “rath”. Ní scarann na taifid cónaitheoirí, daoine atá i láthair agus daoine atá nasctha le heachtraí trí fhianaise iontaofa.',[
   'Cad ba cheart a iarraidh ar an athbhreithniú a scrúdú?','Is féidir le heispéireas pobail, imscaradh, roghnú agus cóireáil gnéithe éagsúla a léiriú. Ní réitíonn ainmneoir amháin gach ceist.',
   'Conas a mhúnlaíonn tosaíochtaí agus dreasachtaí patróil an roghnú, chomh maith le forais agus cóireáil.','Áirítear cinntí eagraíochtúla chomh maith le teagmhálacha aonair.',
   'An méadaíonn sprioc chuardaigh níos airde líon na n-aimsithe amháin.','Ní chruthaíonn líon cinntí dleathacha ná córa.'
  ],[
   'Cad ba chóir a bheith san athbhreithniú?','Braitheann cé a chastar ar phatróil go páirteach ar imscaradh agus tosaíochtaí. Scrúdaigh comhthéacs cinntí agus cáilíocht na gcinntí féin.',
   'Imscaradh, forais, cóireáil agus torthaí a scrúdú le cosaintí cuí sonraí.','Leathnaíonn sé cuntasacht gan glacadh leis go réitíonn tagarmharc amháin gach ceist.',
   'Comparáid le cionmhaireachtaí daonáirimh cónaitheoirí amháin a mheas mar mhíniú iomlán.','Ní fhreagraíonn ainmneoir amháin gach ceist faoi nochtadh sráide, imscaradh agus roghnú dleathach.',
   'Spriocanna cuardaigh a ardú go bhfeabhsaíonn líon na n-aimsithe.','Ní tomhas cáilíochta dlíthiúla ná cóireála cóire é líon amháin, agus d’fhéadfadh sé brú chun gníomhaíocht le forais laga a chruthú.'
  ]),
  'supervision-training':n('Chríochnaigh gach duine an cluiche','Críochnaíonn foireann an cluiche agus feabhsaíonn a freagraí tráth na gceist. Moltar a fhógairt gur laghdaíodh claonadh i bhfíorchuardaigh Gardaí. Feiceann an sáirsint agus an t-athbhreithneoir pobail an maíomh céanna.',[
   'Cad a d’iarrfá sula nglacann tú leis an maíomh?','Tomhaiseann scór feidhmíocht sa chleachtadh. Ní chruthaíonn sé athrú iompair, laghdú idirdhealaithe ná eispéireas poiblí níos fearr.',
   'Cad iad na torthaí sa saol fíor a tomhaiseadh seachas freagraí an tráth na gceist.','Scarann sé toradh foghlama úsáideach ó mhaíomh faoi chleachtas.',
   'Scór níos airde a mheas mar chruthúnas go bhfuil deireadh le claonadh sa saol fíor.','Ní thacaíonn an fhianaise leis an gconclúid sin.'
  ],[
   'Cad a thacaíonn an toradh sin leis i ndáiríre?','Léiríonn freagraí feabhsaithe foghlaim ar an tomhas sin. Ní chruthaíonn siad iompar oibríochtúil athraithe, laghdú idirdhealaithe ná éifeachtaí buana.',
   'Laghdú cruthaithe claonta a mhaíomh mar gur éirigh leis an bhfoireann sa ghníomhaíocht.','Fágann sé an fhianaise a nascann rannpháirtíocht le cinntí agus cóireáil sa saol fíor ar lár.',
   'An toradh foghlama a thuairisciú go cruinn agus measúnú iompair agus eispéiris a phleanáil.','Coinníonn tú an toradh úsáideach gan áibhéil faoin méid a léiríonn sé.',
   'Gach oiliúint a thréigean mar nár aimsigh roinnt staidéar éifeacht shoiléir ar dhifríochtaí.','Teastaíonn measúnú ar leith ar idirghabhálacha agus torthaí éagsúla. Ba chóir do theorainneacha an dearadh agus an measúnú a threorú.'
  ]),
  'supervision-plan':n('Céad chéim eile níos láidre','Measann an grúpa foghlaim leantach, athbhreithniú maoirseachta agus measúnú. Is é an cuspóir cinntí agus eispéireas poiblí níos fearr. Ní bhailítear sonraí eachtraí oibríochtúla sa chluiche seo.',[
   'Cad a thabharfadh ról úsáideach d’ionchur pobail?','Aontaigh cad is feabhas ann agus conas a mheasfar forais, cóireáil agus eispéireas le cosaintí cuí. Ní leor comhaireamh críochnaithe amháin.',
   'Cabhrú le torthaí a shainiú agus páirt a ghlacadh i measúnú neamhspleách le tacaíocht chuí.','Nascann sé eispéireas pobail le plean is féidir a athbhreithniú.',
   'Eachtraí inaitheanta a fhoilsiú sa chluiche gan socruithe láimhseála a aontú.','Ní córas bailithe sonraí oibríochtúla é an fréamhshamhail seo.'
  ],[
   'Cén plean a phléann leis na príomhbhearnaí fianaise?','Cuir cleachtadh agus aiseolas athfhillteach le hathbhreithniú dleathach comhréireach ar iompar agus eispéireas pobail. Aontaigh tomhais agus cosaintí sula mbailítear sonraí oibríochtúla.',
   'An tráth na gceist céanna a athdhéanamh láithreach agus a scór a úsáid mar rátáil bhuan feidhmíochta.','D’fhéadfadh freagraí athdhéanta taithí ar cheisteanna a léiriú. Ní measúnú bailíochtaithe ar Gharda é scór foghlama.',
   'Sonraí inaitheanta eachtraí a bhailiú sa chluiche chun cuma oibríochtúil a thabhairt dó.','Níl an fréamhshamhail deartha ná ceadaithe chun sonraí oibríochtúla nó pearsanta eachtraí a choinneáil.',
   'Cleachtadh níos déanaí, athbhreithniú neamhspleách ar fhorais agus cóireáil, agus measúnú le hionchur pobail a úsáid.','Tugann sé bealach níos inchreidte chun aistriú foghlama agus éifeachtaí neamhbheartaithe a scrúdú. Is moladh é fós a éilíonn rialachas cuí.'
  ])
 }}
});
