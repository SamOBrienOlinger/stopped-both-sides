// Columns follow this order so each piece of UI copy can be reviewed together.
const languages = ['ga','pt','ar','pl','ro','fr','es','zh-Hans'];

const labels = [
 ['Your avatar', ['D’avatár','O teu avatar','صورتك الرمزية','Twój awatar','Avatarul tău','Votre avatar','Tu avatar','你的头像']],
 ['Character information', ['Eolas faoin gcarachtar','Informações sobre a personagem','معلومات الشخصية','Informacje o postaci','Informații despre personaj','Informations sur le personnage','Información sobre el personaje','角色信息']],
 ['Public witness', ['Finné ón bpobal','Testemunha do público','شاهد من الجمهور','Świadek z grona osób postronnych','Martor din rândul publicului','Témoin membre du public','Testigo del público','公众目击者']],
 ['Witnessing Garda', ['Garda atá ina fhinné','Garda que testemunha a situação','عنصر الغاردا الشاهد','Funkcjonariusz Garda będący świadkiem','Membru Garda martor','Garda témoin','Garda que presencia la situación','目击事件的警员']],
 ['Witnessing a colleague', ['Iompar comhghleacaí a fheiceáil','Testemunhar a conduta de um colega','مشاهدة سلوك زميل','Będąc świadkiem zachowania współpracownika','Martor la comportamentul unui coleg','Témoin du comportement d’un collègue','Presenciar la conducta de un colega','目击同事的行为']],
 ['Human and Civil Rights', ['Cearta Daonna agus Sibhialta','Direitos humanos e civis','حقوق الإنسان والحقوق المدنية','Prawa człowieka i prawa obywatelskie','Drepturile omului și drepturile civile','Droits humains et civils','Derechos humanos y civiles','人权和公民权利']],
 ['Back to Top', ['Ar ais go barr','Voltar ao topo','العودة إلى الأعلى','Powrót na górę','Înapoi sus','Retour en haut','Volver arriba','返回顶部']],
 ['One situation.', ['Cás amháin.','Uma situação.','موقف واحد.','Jedna sytuacja.','O situație.','Une situation.','Una situación.','同一个情境。']],
 ['Two perspectives.', ['Dhá dhearcadh.','Duas perspetivas.','منظوران.','Dwie perspektywy.','Două perspective.','Deux perspectives.','Dos perspectivas.','两种视角。']],
 ['Discrimination', ['Idirdhealú','Discriminação','التمييز','Dyskryminacja','Discriminare','Discrimination','Discriminación','歧视']],
 ['10 protected grounds', ['10 bhforas faoi chosaint','10 motivos protegidos','10 أسباب يحميها القانون','10 przesłanek objętych ochroną','10 criterii protejate','10 motifs protégés','10 motivos protegidos','10 项受保护事由']],
 ['Gender', ['Inscne','Género','النوع الاجتماعي','Płeć','Gen','Genre','Género','性别']],
 ['Civil status', ['Stádas sibhialta','Estado civil','الحالة المدنية','Stan cywilny','Stare civilă','État civil','Estado civil','婚姻及民事伴侣状况']],
 ['Family status', ['Stádas teaghlaigh','Situação familiar','الوضع العائلي','Sytuacja rodzinna','Statut familial','Situation familiale','Situación familiar','家庭状况']],
 ['Sexual orientation', ['Claonadh gnéasach','Orientação sexual','التوجه الجنسي','Orientacja seksualna','Orientare sexuală','Orientation sexuelle','Orientación sexual','性取向']],
 ['Age', ['Aois','Idade','العمر','Wiek','Vârstă','Âge','Edad','年龄']],
 ['Religious belief', ['Creideamh reiligiúnach','Crença religiosa','المعتقد الديني','Przekonania religijne','Credință religioasă','Croyance religieuse','Creencias religiosas','宗教信仰']],
 ['Traveller community', ['Pobal an Lucht Siúil','Comunidade Traveller irlandesa','مجتمع الرحّل الأيرلنديين','Irlandzka społeczność Travellers','Comunitatea irlandeză Traveller','Communauté des Travellers irlandais','Comunidad irlandesa Traveller','爱尔兰游民社群']],
 ['Race', ['Cine','Raça','العرق','Rasa','Rasă','Race','Raza','种族']],
 ['Disability', ['Míchumas','Deficiência','الإعاقة','Niepełnosprawność','Dizabilitate','Handicap','Discapacidad','残障']],
 ['Housing assistance', ['Cúnamh tithíochta','Apoio à habitação','إعانة السكن','Pomoc mieszkaniowa','Ajutor pentru locuință','Aide au logement','Ayuda para la vivienda','住房援助']],
 ['The Discrimination scenarios are in English.', [
  'Tá na cásanna faoin idirdhealú i mBéarla.','Os casos de discriminação estão em inglês.','سيناريوهات التمييز باللغة الإنجليزية.','Scenariusze dotyczące dyskryminacji są w języku angielskim.',
  'Scenariile despre discriminare sunt în limba engleză.','Les situations sur la discrimination sont en anglais.','Las situaciones de discriminación están en inglés.','歧视主题情境的内容为英语。'
 ]],
 ['Housing assistance applies to accommodation. The rules for other grounds depend on the setting.', [
  'Baineann an foras maidir le cúnamh tithíochta le cóiríocht. Braitheann na rialacha maidir le forais eile ar an gcomhthéacs.',
  'O motivo relativo ao apoio à habitação aplica-se ao alojamento. As regras para os outros motivos dependem do contexto.',
  'ينطبق سبب إعانة السكن على توفير السكن. وتعتمد قواعد الأسباب الأخرى على السياق.',
  'Przesłanka pomocy mieszkaniowej dotyczy zakwaterowania. Zasady dotyczące pozostałych przesłanek zależą od sytuacji.',
  'Criteriul ajutorului pentru locuință se aplică furnizării de cazare. Regulile pentru celelalte criterii depind de context.',
  'Le motif de l’aide au logement s’applique à la fourniture d’un logement. Les règles pour les autres motifs dépendent du contexte.',
  'El motivo de la ayuda para la vivienda se aplica al alojamiento. Las reglas sobre los demás motivos dependen del contexto.',
  '住房援助这一事由适用于住宿提供。其他事由适用的规则取决于具体情境。'
 ]],
 ['Read IHREC’s protected grounds', [
  'Léigh na forais faoi chosaint a leagann IHREC amach','Consulte os motivos protegidos da IHREC','اقرأ عن الأسباب المحمية لدى IHREC','Przeczytaj listę przesłanek chronionych według IHREC',
  'Citește lista criteriilor protejate publicată de IHREC','Consultez les motifs protégés présentés par l’IHREC','Consulta los motivos protegidos que recoge la IHREC','查看 IHREC 列出的受保护事由'
 ]],
 ['3–4 minutes', ['3–4 nóiméad','3–4 minutos','٣–٤ دقائق','3–4 minuty','3–4 minute','3–4 minutes','3–4 minutos','3–4 分钟']],
 ['Explore the same situations from the public and Garda perspectives. Choose a response, read the explanation and follow the situation to a recap. You can revisit earlier decisions and revisit a route.', [
  'Fiosraigh na cásanna céanna ó dhearcadh an phobail agus an Gharda. Roghnaigh freagra, léigh an míniú agus lean an cás go dtí an t-achoimre. Is féidir filleadh ar chinntí roimhe seo agus an bealach a imirt arís.',
  'Explore as mesmas situações das perspetivas do público e da Garda. Escolha uma resposta, leia a explicação e avance até ao resumo. Pode voltar às decisões anteriores e repetir um percurso.',
  'استكشف المواقف نفسها من منظور الجمهور ومنظور الشرطة. اختر إجابة واقرأ شرحها وتابع الموقف حتى الملخص. يمكنك الرجوع إلى القرارات السابقة وإعادة المسار.',
  'Poznaj te same sytuacje z perspektywy obywatela i funkcjonariusza Garda. Wybierz reakcję, przeczytaj wyjaśnienie i przejdź do podsumowania. Możesz wrócić do wcześniejszych decyzji i ponownie przejść daną ścieżkę.',
  'Explorează aceleași situații din perspectiva publicului și a unui membru al Garda. Alege un răspuns, citește explicația și continuă până la recapitulare. Poți reveni la deciziile anterioare și relua un traseu.',
  'Explorez les mêmes situations du point de vue du public et de la Garda. Choisissez une réponse, lisez l’explication et poursuivez jusqu’au récapitulatif. Vous pouvez revenir sur vos décisions et rejouer un parcours.',
  'Explora las mismas situaciones desde la perspectiva del público y de la Garda. Elige una respuesta, lee la explicación y continúa hasta el resumen. Puedes volver a decisiones anteriores y repetir un recorrido.',
  '从公众和爱尔兰警察的视角了解相同的情境。选择回应、阅读解释并继续到回顾环节。你可以返回先前的决定并重新体验。'
 ]],
 ['Irish covers the original shared learning activity. Portuguese, Arabic, Polish, Romanian, French, Spanish and Simplified Chinese also cover individual practice and reference pages.', [
  'Tá an bunleagan den chluiche roinnte ar fáil i nGaeilge. Tá cleachtadh aonair agus na leathanaigh thagartha ar fáil freisin i bPortaingéilis, Araibis, Polainnis, Rómáinis, Fraincis, Spáinnis agus Sínis shimplithe.',
  'O irlandês está disponível no jogo partilhado original. O português, o árabe, o polaco, o romeno, o francês, o espanhol e o chinês simplificado também abrangem a prática individual e as páginas de referência.',
  'تتوفر الأيرلندية في اللعبة الأصلية المشتركة. وتشمل البرتغالية والعربية والبولندية والرومانية والفرنسية والإسبانية والصينية المبسطة التدريب الفردي وصفحات المراجع أيضًا.',
  'Język irlandzki jest dostępny w pierwotnych sytuacjach wspólnych. Portugalski, arabski, polski, rumuński, francuski, hiszpański i chiński uproszczony obejmują również ćwiczenia indywidualne i materiały źródłowe.',
  'Irlandeza acoperă jocul comun original. Portugheza, araba, polona, româna, franceza, spaniola și chineza simplificată acoperă și exercițiile individuale și paginile de referință.',
  'L’irlandais est disponible dans le jeu partagé d’origine. Le portugais, l’arabe, le polonais, le roumain, le français, l’espagnol et le chinois simplifié couvrent aussi les exercices individuels et les pages de référence.',
  'El irlandés está disponible en el juego compartido original. El portugués, el árabe, el polaco, el rumano, el francés, el español y el chino simplificado también abarcan las prácticas individuales y las páginas de referencia.',
  '爱尔兰语适用于原有的双视角情境。葡萄牙语、阿拉伯语、波兰语、罗马尼亚语、法语、西班牙语和简体中文还适用于单角色练习及参考页面。'
 ]],
 ['Choosing Irish during individual practice opens the matching shared situation. Published source titles and authors retain their original form.', [
  'Má roghnaíonn tú Gaeilge le linn cleachtadh aonair, osclófar an cás roinnte comhfhreagrach. Coinnítear teidil agus údair na bhfoinsí foilsithe ina mbunfhoirm.',
  'Escolher irlandês durante a prática individual abre a situação partilhada correspondente. Os títulos e autores das fontes publicadas são apresentados na forma original.',
  'يؤدي اختيار الأيرلندية في التدريب الفردي إلى فتح الموقف المشترك المقابل. تُعرض عناوين المصادر المنشورة وأسماء مؤلفيها بصيغتها الأصلية.',
  'Wybór języka irlandzkiego podczas ćwiczenia indywidualnego otwiera odpowiednią sytuację wspólną. Tytuły i autorzy opublikowanych źródeł zachowują oryginalną formę.',
  'Alegerea limbii irlandeze în timpul unui exercițiu individual deschide situația comună corespunzătoare. Titlurile și autorii surselor publicate își păstrează forma originală.',
  'Choisir l’irlandais pendant un exercice individuel ouvre la situation partagée correspondante. Les titres et les noms des auteurs des sources publiées gardent leur forme d’origine.',
  'Elegir el irlandés durante una práctica individual abre la situación compartida correspondiente. Los títulos y los nombres de los autores de las fuentes publicadas conservan su forma original.',
  '在单角色练习中选择爱尔兰语会打开相应的双视角情境。已发表资料的标题和作者姓名保留原样。'
 ]],
 ['Explore both perspectives', [
  'Fiosraigh an dá dhearcadh','Explore as duas perspetivas','استكشف وجهتي النظر','Poznaj obie perspektywy',
  'Explorează ambele perspective','Explorez les deux points de vue','Explora ambas perspectivas','探索双方视角'
 ]],
 ['decision left', [
  'chinneadh fágtha','decisão por tomar','قرار متبقٍ','decyzja do podjęcia',
  'decizie rămasă','décision restante','decisión pendiente','个决定待完成'
 ]],
 ['decisions left', [
  'chinneadh fágtha','decisões por tomar','قرارات متبقية','decyzje do podjęcia',
  'decizii rămase','décisions restantes','decisiones pendientes','个决定待完成'
 ]],
 ['Fictional search records', [
  'Taifid fhicseanúla cuardaigh','Registos fictícios de buscas','سجلات تفتيش خيالية','Fikcyjne dane o przeszukaniach',
  'Evidențe fictive ale perchezițiilor','Données fictives sur les fouilles','Registros ficticios de registros policiales','虚构搜查记录'
 ]],
 ['Group', [
  'Grúpa','Grupo','المجموعة','Grupa','Grup','Groupe','Grupo','组别'
 ]],
 ['Group A', [
  'Grúpa A','Grupo A','المجموعة أ','Grupa A','Grupul A','Groupe A','Grupo A','A 组'
 ]],
 ['Group B', [
  'Grúpa B','Grupo B','المجموعة ب','Grupa B','Grupul B','Groupe B','Grupo B','B 组'
 ]],
 ['Finds', [
  'Torthaí','Buscas com resultado','مرات العثور','Z wynikiem','Cu rezultat','Fouilles avec résultat','Registros con hallazgo','搜出物品次数'
 ]],
 ['Find rate', [
  'Ráta aimsithe','Taxa de achados','نسبة العثور','Odsetek z wynikiem','Proporția cu rezultat','Taux de découverte','Tasa de hallazgos','查获比例'
 ]],
 ['Read the meeting background', [
  'Léigh cúlra an chruinnithe','Leia o contexto da reunião','اقرأ خلفية الاجتماع','Przeczytaj, skąd wzięło się spotkanie',
  'Citește contextul întâlnirii','Lire le contexte de la réunion','Lee el contexto de la reunión','阅读会议背景'
 ]],
 ['Terms in this decision', [
  'Téarmaí sa chinneadh seo','Termos desta decisão','مصطلحات هذا القرار','Pojęcia związane z decyzją',
  'Termeni din această decizie','Termes utiles pour cette décision','Términos de esta decisión','本次决定中的术语'
 ]],
 ['Explore what else might help', [
  'Fiosraigh cén t-eolas eile a chabhródh','Explore que outros dados ajudariam','استكشف ما قد يفيد أيضًا','Sprawdź, jakie dane mogą jeszcze pomóc',
  'Explorează ce alte informații ar ajuta','Explorer les informations qui pourraient aider','Explora qué otros datos ayudarían','探索哪些补充信息有帮助'
 ]],
 ['Choose one hypothetical detail to consider.', [
  'Roghnaigh sonra hipitéiseach amháin le breithniú.','Escolha um dado hipotético para analisar.','اختر معلومة افتراضية واحدة لتبحث فيها.','Wybierz jedną hipotetyczną informację do rozważenia.',
  'Alege un detaliu ipotetic pe care să îl analizezi.','Choisissez un détail hypothétique à examiner.','Elige un dato hipotético para analizar.','选择一项假设信息加以考虑。'
 ]],
 ['Observed', [
  'Breathnaithe','Observado','تمت ملاحظته','Zaobserwowane','Observat','Observé','Observado','直接观察'
 ]],
 ['Reported', [
  'Tuairiscithe','Comunicado','ورد في إفادة','Zgłoszone','Raportat','Rapporté','Comunicado','他人报告'
 ]],
 ['Still to check', [
  'Le seiceáil fós','A verificar','يحتاج إلى تحقق','Do sprawdzenia','De verificat','À vérifier','Por comprobar','仍待核实'
 ]],
 ['This detail was directly observed.', [
  'Breathnaíodh ar an sonra seo go díreach.','Este pormenor foi observado diretamente.','لوحظت هذه المعلومة مباشرة.','Ten szczegół został bezpośrednio zaobserwowany.',
  'Acest detaliu a fost observat direct.','Ce détail a été observé directement.','Este detalle se observó directamente.','这项信息是直接观察到的。'
 ]],
 ['This information was reported by someone.', [
  'Thug duine éigin an t-eolas seo.','Esta informação foi comunicada por alguém.','نقل شخص ما هذه المعلومة.','Tę informację przekazała inna osoba.',
  'Această informație a fost raportată de cineva.','Quelqu’un a rapporté cette information.','Alguien comunicó esta información.','这项信息来自他人的报告。'
 ]],
 ['The information in the scene does not settle this question.', [
  'Ní leor an t-eolas sa radharc leis an gceist seo a fhreagairt.','A informação da cena não resolve esta questão.','المعلومات في المشهد لا تحسم هذا السؤال.','Informacje w tej sytuacji nie rozstrzygają tej kwestii.',
  'Informațiile din scenă nu lămuresc această întrebare.','Les informations de la scène ne permettent pas de trancher.','La información de la escena no resuelve esta cuestión.','场景中的信息尚不能回答这个问题。'
 ]],
 ['Look again at where this information came from.', [
  'Féach arís ar fhoinse an eolais seo.','Reveja de onde veio esta informação.','انظر مجددًا إلى مصدر هذه المعلومة.','Sprawdź jeszcze raz, skąd pochodzi ta informacja.',
  'Verifică din nou de unde provine informația.','Regardez à nouveau d’où vient cette information.','Fíjate de nuevo en el origen de esta información.','再看看这项信息来自哪里。'
 ]],
 ['Check the facts', [
  'Seiceáil na fíricí','Confira os factos','تحقق من الوقائع','Sprawdź fakty','Verifică faptele','Vérifier les faits','Comprueba los hechos','核对事实'
 ]],
 ['How is each detail known?', [
  'Conas atá gach sonra ar eolas?','Como se conhece cada pormenor?','كيف عُرفت كل معلومة؟','Skąd wiadomo o każdym szczególe?',
  'De unde se cunoaște fiecare detaliu?','Comment connaît-on chaque détail ?','¿Cómo se conoce cada detalle?','每项信息是怎么得知的？'
 ]],
 ['This role’s question', [
  'Ceist an róil seo','Pergunta para este papel','سؤال هذا الدور','Pytanie dla tej roli',
  'Întrebarea pentru acest rol','Question pour ce rôle','Pregunta para este papel','这个角色要回答的问题'
 ]],
 ['Your answer', [
  'Do fhreagra','A sua resposta','إجابتك','Twoja odpowiedź','Răspunsul tău','Votre réponse','Tu respuesta','你的回答'
 ]],
 ['No answer yet', [
  'Gan freagra fós','Ainda sem resposta','لا إجابة بعد','Jeszcze bez odpowiedzi','Niciun răspuns încă','Aucune réponse pour le moment','Aún sin respuesta','尚未回答'
 ]],
 ['Compare this decision', [
  'Cuir an cinneadh seo i gcomparáid','Compare esta decisão','قارن هذا القرار','Porównaj tę decyzję',
  'Compară această decizie','Comparer cette décision','Compara esta decisión','比较这次决定'
 ]],
 ['Try what you learned', [
  'Bain triail as an méid a d’fhoghlaim tú','Ponha em prática o que aprendeu','طبّق ما تعلمته','Zastosuj to, czego się uczysz',
  'Pune în practică ce ai învățat','Mettez en pratique ce que vous avez appris','Pon en práctica lo aprendido','试着运用所学'
 ]],
 ['What new fact would change your response?', [
  'Cén fhíric nua a d’athródh do fhreagra?','Que novo facto mudaria a sua resposta?','ما المعلومة الجديدة التي قد تغير إجابتك؟','Jaki nowy fakt zmieniłby Twoją odpowiedź?',
  'Ce informație nouă ți-ar schimba răspunsul?','Quel fait nouveau changerait votre réponse ?','¿Qué dato nuevo cambiaría tu respuesta?','哪个新事实会改变你的回答？'
 ]],
 ['Try a related situation', [
  'Bain triail as cás gaolmhar','Experimente uma situação relacionada','جرّب موقفًا ذا صلة','Wypróbuj podobną sytuację',
  'Încearcă o situație asemănătoare','Essayer une situation similaire','Prueba una situación relacionada','尝试相关情境'
 ]],
 ['Explore and discuss this situation', [
  'Imir agus pléigh an cás seo','Jogue e discuta esta situação','العب وناقش هذا الموقف','Rozegraj i omów tę sytuację',
  'Joacă și discută această situație','Jouer et discuter de cette situation','Juega y comenta esta situación','体验并讨论这个情境'
 ]],
 ['Allow about 15 minutes.', [
  'Cuir thart ar 15 nóiméad ar leataobh.','Reserve cerca de 15 minutos.','خصّص نحو 15 دقيقة.','Zarezerwuj około 15 minut.',
  'Rezervă aproximativ 15 minute.','Prévoyez environ 15 minutes.','Reserva unos 15 minutos.','预留约 15 分钟。'
 ]],
 ['Choose a participant. Other people can follow along as observers.', [
  'Roghnaigh imreoir. Is féidir le daoine eile breathnú ar an imirt.','Escolham quem joga. As outras pessoas podem acompanhar como observadoras.','اختاروا لاعبًا. يمكن للآخرين المتابعة بصفة مراقبين.','Wybierzcie osobę grającą. Pozostali mogą obserwować.',
  'Alegeți o persoană care joacă. Ceilalți pot urmări ca observatori.','Choisissez qui joue. Les autres peuvent suivre en observateurs.','Elijan quién juega. Las demás personas pueden observar.','选一位玩家，其他人可以旁观。'
 ]],
 ['Pause after a decision and compare what each person had to consider.', [
  'Stop tar éis cinnidh agus cuir i gcomparáid an méid a bhí le breithniú ag gach duine.','Façam uma pausa após uma decisão e comparem o que cada pessoa teve de ponderar.','توقفوا بعد قرار وقارنوا ما كان على كل شخص مراعاته.','Zatrzymajcie się po decyzji i porównajcie, co każda osoba musiała uwzględnić.',
  'Opriți-vă după o decizie și comparați ce a trebuit să ia în calcul fiecare persoană.','Faites une pause après une décision et comparez ce que chacun devait prendre en compte.','Hagan una pausa tras una decisión y comparen lo que cada persona tuvo que considerar.','做出一次决定后暂停，比较双方分别需要考虑什么。'
 ]],
 ['Discuss these two questions together.', [
  'Pléigh an dá cheist seo le chéile.','Discutam estas duas perguntas em conjunto.','ناقشوا هذين السؤالين معًا.','Omówcie wspólnie te dwa pytania.',
  'Discutați împreună aceste două întrebări.','Discutez ensemble de ces deux questions.','Comenten juntos estas dos preguntas.','一起讨论这两个问题。'
 ]],
 ['What you have practised', [
  'An méid atá cleachtaithe agat','O que praticou','ما تدربت عليه','Co masz przećwiczone',
  'Ce ai exersat','Ce que vous avez pratiqué','Lo que has practicado','你练习过的内容'
 ]],
 ['Answered from both perspectives at the same decision', [
  'Thug tú freagra ón dá dhearcadh ar an gcinneadh céanna','Respondeu das duas perspetivas na mesma decisão','أجبت من وجهتي النظر في القرار نفسه','Odpowiedź z obu perspektyw przy tej samej decyzji',
  'Ai răspuns din ambele perspective la aceeași decizie','Vous avez répondu des deux points de vue à la même décision','Respondiste desde ambas perspectivas en la misma decisión','从双方视角回答了同一次决定'
 ]],
 ['Find advice or support', [
  'Faigh comhairle nó tacaíocht','Procurar aconselhamento ou apoio','اعثر على مشورة أو دعم','Znajdź poradę lub wsparcie',
  'Găsește consiliere sau sprijin','Trouver des conseils ou du soutien','Busca asesoramiento o apoyo','寻找建议或支持'
 ]]
];

const content = [
 ['Asking why you have been stopped', [
  'Fiafraí cén fáth ar stopadh thú','Perguntar porque foi abordado','السؤال عن سبب توقيفك','Pytanie o powód zatrzymania',
  'Întrebarea privind motivul opririi','Demander pourquoi on vous a arrêté dans la rue','Preguntar por qué te han parado','询问被拦下的原因'
 ]],
 ['Asking what a search is based on', [
  'Fiafraí cén bunús atá leis an gcuardach','Perguntar em que se baseia uma busca','السؤال عن أساس التفتيش','Pytanie o podstawę przeszukania',
  'Întrebarea privind temeiul percheziției','Demander sur quoi repose une fouille','Preguntar en qué se basa un registro','询问搜查的依据'
 ]],
 ['Asking about the arrest and a possible mistake', [
  'Fiafraí faoin ngabháil agus faoi bhotún a d’fhéadfadh a bheith déanta','Perguntar sobre a detenção e um possível engano','السؤال عن الاعتقال واحتمال وقوع خطأ','Pytanie o zatrzymanie i możliwą pomyłkę',
  'Întrebări despre arestare și o posibilă greșeală','Poser des questions sur l’arrestation et une possible erreur','Preguntar por la detención y un posible error','询问逮捕原因和可能出现的错误'
 ]],
 ['Checking that an explanation is understood', [
  'Seiceáil gur tuigeadh an míniú','Confirmar que a explicação foi compreendida','التأكد من فهم الشرح','Sprawdzanie, czy wyjaśnienie zostało zrozumiane',
  'Verificarea înțelegerii unei explicații','Vérifier qu’une explication a été comprise','Comprobar que se ha entendido una explicación','确认对方是否理解解释'
 ]],
 ['Making age and support needs clear', [
  'Aois agus riachtanais tacaíochta a shoiléiriú','Esclarecer a idade e as necessidades de apoio','توضيح العمر والاحتياجات إلى الدعم','Wyjaśnianie wieku i potrzeb wsparcia',
  'Clarificarea vârstei și a nevoilor de sprijin','Préciser l’âge et les besoins de soutien','Aclarar la edad y las necesidades de apoyo','说明年龄和所需支持'
 ]],
 ['Recording what happened and finding support', [
  'An méid a tharla a thaifeadadh agus tacaíocht a aimsiú','Registar o que aconteceu e encontrar apoio','تدوين ما حدث والبحث عن الدعم','Zapisywanie przebiegu zdarzenia i szukanie wsparcia',
  'Notarea celor întâmplate și găsirea de sprijin','Noter ce qui s’est passé et trouver du soutien','Anotar lo ocurrido y buscar apoyo','记录经过并寻找支持'
 ]],
 ['Separating observations from assumptions', [
  'Breathnuithe agus toimhdí a dheighilt','Distinguir observações de suposições','التمييز بين الملاحظات والافتراضات','Odróżnianie obserwacji od przypuszczeń',
  'Separarea observațiilor de presupuneri','Distinguer les observations des suppositions','Distinguir lo observado de lo supuesto','区分观察与假设'
 ]],
 ['Checking how specific a description is', [
  'A sheiceáil cé chomh sonrach agus atá cur síos','Verificar até que ponto uma descrição é específica','التحقق من مدى دقة الوصف','Sprawdzanie, na ile dokładny jest opis',
  'Verificarea preciziei unei descrieri','Vérifier à quel point un signalement est précis','Comprobar lo concreta que es una descripción','检查描述是否具体'
 ]],
 ['Checking the facts behind a proposed search', [
  'Na fíricí taobh thiar de chuardach molta a sheiceáil','Verificar os factos por detrás de uma busca proposta','التحقق من الوقائع التي يستند إليها التفتيش المقترح','Sprawdzanie faktów stojących za proponowanym przeszukaniem',
  'Verificarea faptelor din spatele unei percheziții propuse','Vérifier les faits qui motivent une fouille proposée','Comprobar los hechos que motivan un registro propuesto','核实拟议搜查所依据的事实'
 ]],
 ['Checking understanding before judging behaviour', [
  'Tuiscint a sheiceáil sula dtugtar breithiúnas ar iompar','Confirmar a compreensão antes de avaliar o comportamento','التأكد من الفهم قبل الحكم على السلوك','Sprawdzanie zrozumienia przed oceną zachowania',
  'Verificarea înțelegerii înainte de a judeca un comportament','Vérifier la compréhension avant de juger un comportement','Comprobar la comprensión antes de juzgar la conducta','评价行为前先确认理解情况'
 ]],
 ['Keeping age and the stated facts in view', [
  'Aois agus na fíricí atá luaite a choinneáil i gcuimhne','Ter em conta a idade e os factos conhecidos','مراعاة العمر والوقائع المذكورة','Pamiętanie o wieku i podanych faktach',
  'Luarea în considerare a vârstei și a faptelor cunoscute','Garder à l’esprit l’âge et les faits établis dans la scène','Tener presentes la edad y los hechos expuestos','牢记年龄与已知事实'
 ]],
 ['Questioning assumptions about a family', [
  'Toimhdí faoi theaghlach a cheistiú','Questionar suposições sobre uma família','مراجعة الافتراضات عن عائلة','Kwestionowanie przypuszczeń na temat rodziny',
  'Punerea sub semnul întrebării a presupunerilor despre o familie','Remettre en question des suppositions sur une famille','Cuestionar las suposiciones sobre una familia','质疑对一个家庭的预设判断'
 ]],
 ['Reassessing a decision when the facts change', [
  'Cinneadh a athmheas nuair a athraíonn na fíricí','Reavaliar uma decisão quando os factos mudam','إعادة تقييم القرار عند تغير الوقائع','Ponowna ocena decyzji, gdy zmieniają się fakty',
  'Reevaluarea unei decizii când faptele se schimbă','Réexaminer une décision lorsque les faits changent','Reevaluar una decisión cuando cambian los hechos','事实变化后重新评估决定'
 ]],
 ['Identifying what search figures leave out', [
  'A aithint cén t-eolas atá in easnamh sna figiúirí cuardaigh','Identificar o que os números das buscas omitem','تحديد ما لا تبينه أرقام التفتيش','Rozpoznawanie, czego nie pokazują dane o przeszukaniach',
  'Identificarea informațiilor care lipsesc din cifrele despre percheziții','Repérer ce que les chiffres sur les fouilles laissent de côté','Identificar lo que no muestran las cifras de registros','找出搜查数据未能说明的信息'
 ]],
 ['Observation', [
  'Breathnú','Observação','ملاحظة','Obserwacja','Observație','Observation directe','Observación','直接观察'
 ]],
 ['Something you saw or heard yourself.', [
  'Rud a chonaic nó a chuala tú féin.','Algo que viu ou ouviu pessoalmente.','شيء رأيته أو سمعته بنفسك.','Coś, co udało Ci się zobaczyć lub usłyszeć osobiście.',
  'Ceva ce ai văzut sau ai auzit chiar tu.','Ce que vous avez vu ou entendu vous-même.','Algo que has visto u oído personalmente.','你亲眼看见或亲耳听见的事。'
 ]],
 ['Grounds for a search', [
  'Bunús le cuardach','Fundamento de uma busca','أساس التفتيش','Podstawa przeszukania',
  'Temeiul unei percheziții','Fondement d’une fouille','Fundamento de un registro','搜查依据'
 ]],
 ['The information used to explain why this particular search is proposed.', [
  'An t-eolas a úsáidtear lena mhíniú cén fáth a moltar an cuardach áirithe seo.','A informação usada para explicar por que se propõe esta busca em particular.','المعلومات التي تفسر سبب اقتراح هذا التفتيش بالتحديد.','Informacje wykorzystywane do wyjaśnienia, dlaczego proponuje się to konkretne przeszukanie.',
  'Informațiile folosite pentru a explica de ce se propune tocmai această percheziție.','Les informations qui expliquent pourquoi cette fouille précise est proposée.','La información que explica por qué se propone este registro concreto.','用来解释为何拟进行这一次具体搜查的信息。'
 ]],
 ['In custody', [
  'Faoi choimeád','Sob custódia','قيد الاحتجاز','W areszcie policyjnym','În custodia poliției','En garde à vue','Bajo custodia','被羁押'
 ]],
 ['In this situation, being held at a Garda station.', [
  'Sa chás seo, á choinneáil i stáisiún Gardaí.','Nesta situação, estar detido numa esquadra da Garda.','في هذا الموقف، الاحتجاز في مركز تابع للغاردا.','W tej sytuacji oznacza przetrzymywanie w komisariacie Garda.',
  'În această situație, înseamnă a fi ținut la o secție Garda.','Dans cette situation, cela signifie être retenu dans un poste de la Garda.','En esta situación, estar retenido en una comisaría de la Garda.','在这一情境中，指被留置在爱尔兰警局。'
 ]],
 ['Support needs', [
  'Riachtanais tacaíochta','Necessidades de apoio','احتياجات إلى الدعم','Potrzeby wsparcia',
  'Nevoi de sprijin','Besoins de soutien','Necesidades de apoyo','支持需求'
 ]],
 ['Help someone may need to understand what is happening and take part.', [
  'Cabhair a d’fhéadfadh a bheith ag teastáil ó dhuine chun a thuiscint cad atá ag tarlú agus páirt a ghlacadh ann.','Ajuda de que alguém pode precisar para perceber o que acontece e participar.','المساعدة التي قد يحتاج إليها شخص لفهم ما يحدث والمشاركة.','Pomoc potrzebna danej osobie, by zrozumieć sytuację i wziąć w niej udział.',
  'Ajutorul de care cineva ar putea avea nevoie pentru a înțelege ce se întâmplă și a participa.','L’aide dont une personne peut avoir besoin pour comprendre ce qui se passe et participer.','La ayuda que alguien puede necesitar para entender lo que sucede y participar.','为理解正在发生的事并参与其中，一个人可能需要的帮助。'
 ]],
 ['An account of an encounter', [
  'Cuntas ar theagmháil','Relato de um encontro','رواية عن اللقاء','Relacja z kontaktu z policją',
  'Relatarea unei întâlniri','Récit d’une rencontre','Relato de un encuentro','对一次接触的叙述'
 ]],
 ['A description of what happened from one person’s point of view.', [
  'Cur síos ar an méid a tharla ó dhearcadh duine amháin.','Descrição do que aconteceu segundo o ponto de vista de uma pessoa.','وصف لما حدث من وجهة نظر شخص واحد.','Opis tego, co się wydarzyło, z perspektywy jednej osoby.',
  'O descriere a celor întâmplate din perspectiva unei persoane.','Une description de ce qui s’est passé du point de vue d’une personne.','Una descripción de lo ocurrido desde el punto de vista de una persona.','从一个人的视角描述发生了什么。'
 ]],
 ['The share of searches in which something was found.', [
  'An céatadán de chuardaigh inar aimsíodh rud éigin.','A proporção de buscas em que se encontrou algo.','نسبة عمليات التفتيش التي عُثر فيها على شيء.','Odsetek przeszukań, podczas których coś znaleziono.',
  'Proporția perchezițiilor în urma cărora s-a găsit ceva.','La part des fouilles au cours desquelles quelque chose a été trouvé.','La proporción de registros en los que se encontró algo.','查到物品的搜查次数占总搜查次数的比例。'
 ]],
 ['Niamh is at a bus stop with a bag.', [
  'Tá Niamh ag stad bus agus mála aici.','Niamh está numa paragem de autocarro com uma mala.','تنتظر Niamh عند موقف الحافلات ومعها حقيبة.','Niamh jest na przystanku autobusowym z torbą.',
  'Niamh este la o stație de autobuz cu o geantă.','Niamh est à un arrêt de bus avec un sac.','Niamh está en una parada de autobús con un bolso.','Niamh在公交车站，带着一个包。'
 ]],
 ['A search is planned, according to the Garda.', [
  'Dar leis an nGarda, tá cuardach beartaithe.','Segundo o agente da Garda, está prevista uma busca.','بحسب ضابط الغاردا، من المقرر إجراء تفتيش.','Według funkcjonariusza Garda planowane jest przeszukanie.',
  'Potrivit polițistului Garda, este planificată o percheziție.','Selon le Garda, une fouille est prévue.','Según el agente de la Garda, se prevé un registro.','据警员所说，计划进行搜查。'
 ]],
 ['Why this bag is being singled out for a search.', [
  'Cén fáth a roghnaítear an mála seo lena chuardach.','A razão pela qual esta mala foi escolhida para a busca.','سبب اختيار هذه الحقيبة تحديدًا للتفتيش.','Dlaczego do przeszukania wybrano właśnie tę torbę.',
  'De ce a fost aleasă tocmai această geantă pentru percheziție.','Pourquoi ce sac en particulier a été choisi pour la fouille.','Por qué se ha elegido este bolso en concreto para registrarlo.','为何选中这个包进行搜查。'
 ]],
 ['Amina is wearing a dark jacket.', [
  'Tá seaicéad dorcha ar Amina.','Amina está a usar um casaco escuro.','ترتدي Amina سترة داكنة.','Amina ma na sobie ciemną kurtkę.',
  'Amina poartă o jachetă închisă la culoare.','Amina porte une veste sombre.','Amina lleva una chaqueta oscura.','Amina穿着一件深色夹克。'
 ]],
 ['A caller says a bag was stolen.', [
  'Deir glaoiteoir gur goideadh mála.','Uma pessoa diz por telefone que foi roubada uma mala.','يقول متصل إن حقيبة سُرقت.','Osoba dzwoniąca mówi, że skradziono torbę.',
  'O persoană spune la telefon că a fost furată o geantă.','Une personne signale par téléphone qu’un sac a été volé.','Una persona informa por teléfono de que han robado un bolso.','来电者说有个包被偷了。'
 ]],
 ['Whether Amina is the person the caller saw.', [
  'An í Amina an duine a chonaic an glaoiteoir.','Se Amina é a pessoa que o autor da chamada viu.','ما إذا كانت Amina هي الشخص الذي رآه المتصل.','Czy Amina jest osobą, którą widział dzwoniący.',
  'Dacă Amina este persoana pe care a văzut-o cel care a sunat.','Si Amina est la personne que le témoin a vue.','Si Amina es la persona que vio quien llamó.','Amina是否就是来电者看到的人。'
 ]],
 ['Niamh is waiting with a bag.', [
  'Tá Niamh ag fanacht agus mála aici.','Niamh está à espera com uma mala.','تنتظر Niamh ومعها حقيبة.','Niamh czeka z torbą.',
  'Niamh așteaptă cu o geantă.','Niamh attend avec un sac.','Niamh está esperando con un bolso.','Niamh带着一个包在等车。'
 ]],
 ['The briefing mentions drug activity near the bus stop.', [
  'Luaitear gníomhaíocht drugaí gar don stad bus sa chruinniú faisnéise.','A informação da equipa menciona atividade ligada a drogas perto da paragem.','يذكر الإحاطة نشاطًا مرتبطًا بالمخدرات قرب موقف الحافلات.','Na odprawie była mowa o aktywności związanej z narkotykami w pobliżu przystanku.',
  'Informarea menționează activități legate de droguri lângă stație.','Le briefing mentionne une activité liée à la drogue près de l’arrêt de bus.','El informe menciona actividades relacionadas con drogas cerca de la parada.','简报提到公交车站附近有涉毒活动。'
 ]],
 ['Whether there is information connecting Niamh to drugs.', [
  'An bhfuil eolas ann a nascann Niamh le drugaí.','Se há informação que relacione Niamh com drogas.','ما إذا كانت هناك معلومات تربط Niamh بالمخدرات.','Czy są informacje łączące Niamh z narkotykami.',
  'Dacă există informații care o leagă pe Niamh de droguri.','S’il existe des informations qui relient Niamh à la drogue.','Si hay información que relacione a Niamh con drogas.','是否有信息表明Niamh与毒品有关。'
 ]],

 ['You have been asked where you are going. You have not been told why you were stopped.', [
  'Fiafraíodh díot cá bhfuil tú ag dul. Níor insíodh duit cén fáth ar stopadh thú.','Perguntaram-lhe para onde vai. Ainda não lhe disseram por que foi abordado.','سُئلت إلى أين تذهب. لم يُذكر لك سبب إيقافك.','Zapytano Cię, dokąd idziesz. Nie podano powodu zatrzymania.',
  'Ai fost întrebat încotro mergi. Nu ți s-a spus de ce ai fost oprit.','On vous a demandé où vous alliez. On ne vous a pas expliqué pourquoi vous avez été arrêté dans la rue.','Te han preguntado adónde vas. No te han dicho por qué te han parado.','对方问你要去哪里，还没有说明为什么拦下你。'
 ]],
 ['You asked where the person is going. You have not explained a suspected offence or a requirement to stay.', [
  'D’fhiafraigh tú cá bhfuil an duine ag dul. Níor mhínigh tú aon chion amhrasta ná aon cheanglas fanachta.','Perguntou para onde a pessoa vai. Ainda não explicou qualquer suspeita de infração ou obrigação de ficar.','سألت الشخص إلى أين يذهب. لم توضح وجود مخالفة مشتبه بها أو وجوب البقاء.','Pytasz, dokąd osoba idzie. Nie wyjaśniasz podejrzenia popełnienia czynu ani tego, czy musi zostać.',
  'Ai întrebat încotro merge persoana. Nu i-ai explicat vreo suspiciune de infracțiune sau obligația de a rămâne.','Vous avez demandé où la personne allait. Vous n’avez précisé ni infraction présumée ni obligation de rester.','Has preguntado adónde va la persona. Aún no has explicado una posible infracción ni si debe quedarse.','你问了对方要去哪里，还没有说明涉嫌何种违法行为或是否必须留下。'
 ]],
 ['You have been asked to let the Garda search your bag. You have not heard a reason.', [
  'Iarradh ort ligean don Gharda do mhála a chuardach. Níor chuala tú cúis.','Pediram-lhe que deixasse o agente revistar a sua mala. Ainda não ouviu a razão.','طُلب منك السماح لضابط الغاردا بتفتيش حقيبتك. لم تسمع السبب.','Poproszono Cię o zgodę na przeszukanie torby. Nie podano Ci powodu.',
  'Ți s-a cerut să permiți unui polițist Garda să îți percheziționeze geanta. Nu ai auzit motivul.','On vous a demandé de laisser le Garda fouiller votre sac. Vous n’avez pas entendu le motif.','Te han pedido que permitas al agente registrar tu bolso. Aún no has oído el motivo.','警员要求搜查你的包，但你还没有听到理由。'
 ]],
 ['You have proposed a search. You have yet to explain the reason or power you are relying on.', [
  'Mhol tú cuardach. Níl an chúis ná an chumhacht ar a bhfuil tú ag brath mínithe agat fós.','Propôs uma busca. Ainda não explicou a razão ou o poder em que se baseia.','اقترحت إجراء تفتيش. لم توضح بعد السبب أو الصلاحية التي تستند إليها.','Proponujesz przeszukanie. Nie podajesz jeszcze powodu ani uprawnienia, z którego korzystasz.',
  'Ai propus o percheziție. Nu ai explicat încă motivul sau atribuția pe care te bazezi.','Vous avez proposé une fouille. Vous devez encore expliquer son motif ou le pouvoir sur lequel vous vous appuyez.','Has propuesto un registro. Aún te queda explicar el motivo o la facultad en que te basas.','你提出进行搜查，还没有解释理由或所依据的权限。'
 ]],
 ['You have been told you are under arrest for a nearby shop theft. You believe there has been a mistake.', [
  'Dúradh leat go bhfuil tú faoi ghabháil mar gheall ar ghoid i siopa in aice láimhe. Creideann tú go ndearnadh botún.','Disseram-lhe que está detido por um furto numa loja próxima. Pensa que houve um engano.','أُبلغت بأنك قيد الاعتقال على خلفية سرقة من متجر قريب. تعتقد أن خطأً وقع.','Powiedziano Ci, że zatrzymano Cię w związku z kradzieżą w pobliskim sklepie. Uważasz, że doszło do pomyłki.',
  'Ți s-a spus că ești sub arest în legătură cu un furt dintr-un magazin din apropiere. Crezi că este o greșeală.','On vous a annoncé votre arrestation pour un vol dans un magasin voisin. Vous pensez qu’il y a eu une erreur.','Te han dicho que estás bajo arresto por un robo en una tienda cercana. Crees que ha habido un error.','你被告知因附近商店失窃而被捕。你认为对方弄错了。'
 ]],
 ['You have told the person they are under arrest. Their concern about mistaken identity needs to be heard.', [
  'Dúirt tú leis an duine go bhfuil sé faoi ghabháil. Is gá éisteacht lena ábhar imní gur aithníodh an duine mícheart.','Disse à pessoa que está detida. É preciso ouvir a sua preocupação quanto a uma possível confusão de identidade.','أخبرت الشخص بأنه قيد الاعتقال. ينبغي الاستماع إلى مخاوفه من الخطأ في تحديد هويته.','Informujesz osobę o zatrzymaniu. Trzeba wysłuchać jej obaw dotyczących pomyłki co do tożsamości.',
  'I-ai spus persoanei că este sub arest. Trebuie ascultată îngrijorarea ei privind o posibilă confuzie de identitate.','Vous avez annoncé son arrestation à la personne. Il faut écouter sa crainte d’une erreur d’identité.','Has comunicado a la persona que está bajo arresto. Hay que escuchar su preocupación por un posible error de identificación.','你告诉对方其已被捕。对方担心认错了人，需要听取这一疑虑。'
 ]],
 ['You know you are 16 and are thinking about saying you are 18.', [
  'Tá a fhios agat go bhfuil tú 16 bliana d’aois agus tá tú ag smaoineamh ar a rá go bhfuil tú 18.','Sabe que tem 16 anos e pensa dizer que tem 18.','تعرف أن عمرك 16 عامًا وتفكر في القول إن عمرك 18 عامًا.','Wiesz, że masz 16 lat, i zastanawiasz się, czy powiedzieć, że masz 18.',
  'Știi că ai 16 ani și te gândești să spui că ai 18.','Vous savez que vous avez 16 ans et songez à dire que vous en avez 18.','Sabes que tienes 16 años y estás pensando en decir que tienes 18.','你知道自己是 16 岁，正在考虑说自己是 18 岁。'
 ]],
 ['You know the young person is at the station. Their age and understanding need to be checked.', [
  'Tá a fhios agat go bhfuil an duine óg sa stáisiún. Is gá a aois agus a thuiscint a sheiceáil.','Sabe que a pessoa jovem está na esquadra. É preciso confirmar a idade e o que compreendeu.','تعرف أن الشاب في المركز. يجب التحقق من عمره ومدى فهمه.','Wiesz, że młoda osoba jest na posterunku. Należy sprawdzić jej wiek i to, co rozumie.',
  'Știi că tânărul este la secție. Trebuie să îi verifici vârsta și ce a înțeles.','Vous savez que la jeune personne est au poste. Il faut vérifier son âge et sa compréhension.','Sabes que el joven está en comisaría. Hay que comprobar su edad y qué ha entendido.','你知道这位年轻人在警局。需要核实年龄以及其理解情况。'
 ]],
 ['You brought the residents’ concerns to the sergeant and have been shown the search summary.', [
  'Chuir tú ábhair imní na gcónaitheoirí faoi bhráid an tsáirsint agus taispeánadh achoimre na gcuardach duit.','Apresentou ao sargento as preocupações dos moradores e viu o resumo das buscas.','نقلت مخاوف السكان إلى الرقيب واطلعت على ملخص عمليات التفتيش.','Przekazujesz sierżantowi obawy mieszkańców i otrzymujesz zestawienie przeszukań.',
  'Ai transmis sergentului îngrijorările locuitorilor și ți s-a arătat rezumatul perchezițiilor.','Vous avez fait part au sergent des préoccupations des habitants et il vous a montré le récapitulatif des fouilles.','Has transmitido al sargento la preocupación de los vecinos y te han mostrado el resumen de registros.','你向警佐转达了居民的担忧，并看到了搜查汇总。'
 ]],
 ['You shared the search summary with the representative of a local community group. It gives finds and totals for each group.', [
  'Roinn tú achoimre na gcuardach leis an ionadaí ó ghrúpa pobail áitiúil. Tugtar na torthaí agus na hiomláin do gach grúpa inti.','Partilhou o resumo das buscas com o representante do grupo comunitário local. Mostra os achados e os totais por grupo.','شاركت ملخص التفتيش مع ممثل المجموعة المجتمعية المحلية. يوضح عدد عمليات التفتيش وما أسفر عن العثور على شيء في كل مجموعة.','Przedstawiasz przedstawicielowi lokalnej grupy społecznościowej zestawienie. Podaje łączną liczbę przeszukań i liczbę przeszukań z wynikiem dla każdej grupy.',
  'Ai împărtășit rezumatul cu reprezentantul grupului comunitar local. Arată totalurile și rezultatele pentru fiecare grup.','Vous avez montré le récapitulatif au représentant du groupe communautaire local. Il donne les totaux et le nombre de fouilles avec résultat par groupe.','Has compartido el resumen con el representante del grupo comunitario local. Muestra los hallazgos y los totales de cada grupo.','你向当地社区团体代表展示了搜查汇总，其中列出每组的搜查总数和查获次数。'
 ]],
 ['A representative of a local community group meets the supervising Garda sergeant after residents say they felt singled out during searches.', [
  'Buaileann ionadaí ó ghrúpa pobail áitiúil leis an sáirsint maoirseachta tar éis do chónaitheoirí a rá gur bhraith siad gur díríodh orthu le linn cuardaigh.','Um representante de um grupo comunitário local reúne-se com o sargento responsável depois de moradores dizerem que se sentiram alvo de buscas.','يلتقي ممثل عن مجموعة مجتمعية محلية برقيب الغاردا المشرف بعد أن قال سكان إنهم شعروا بأنهم استُهدفوا بالتفتيش.','Przedstawiciel lokalnej grupy społecznościowej spotyka się z nadzorującym sierżantem Garda po tym, jak mieszkańcy zgłosili poczucie, że wybierano ich do przeszukań.',
  'Un reprezentant al unui grup comunitar local se întâlnește cu sergentul Garda responsabil după ce locuitorii spun că s-au simțit vizați la percheziții.','Un représentant d’un groupe communautaire local rencontre le sergent responsable après que des habitants ont dit s’être sentis ciblés lors de fouilles.','Un representante de un grupo comunitario local se reúne con el sargento responsable tras contar los vecinos que se sintieron señalados en los registros.','居民反映在搜查中觉得自己被特别针对。一位当地社区团体代表与负责监督的警佐会面。'
 ]],
 ['Patrol time', [
  'Am patróil','Tempo de patrulha','مدة الدوريات','Czas patroli','Timp de patrulare','Temps de patrouille','Tiempo de patrulla','巡逻时长'
 ]],
 ['Suppose one area received twice as much patrol time.', [
  'Samhlaigh gur caitheadh dhá oiread ama ar patról i gceantar amháin.','Suponha que numa zona se patrulhou durante o dobro do tempo.','افترض أن إحدى المناطق حظيت بضعف مدة الدوريات.','Załóżmy, że w jednym rejonie patrole trwały dwa razy dłużej.',
  'Presupune că o zonă a beneficiat de un timp de patrulare de două ori mai mare.','Supposons que les patrouilles aient duré deux fois plus longtemps dans un secteur.','Supón que se patrulló el doble de tiempo en una zona.','假设某个地区的巡逻时间是另一个地区的两倍。'
 ]],
 ['How might that affect who Gardaí encountered?', [
  'Cén tionchar a d’fhéadfadh a bheith aige sin ar na daoine a casadh leis na Gardaí?','Como poderia isso afetar as pessoas com quem os agentes se cruzaram?','كيف قد يؤثر ذلك في الأشخاص الذين صادفتهم الغاردا؟','Jak mogło to wpłynąć na to, kogo napotkali funkcjonariusze?',
  'Cum ar putea influența asta persoanele cu care s-au întâlnit polițiștii?','Comment cela aurait-il pu influencer les personnes rencontrées par les Gardaí ?','¿Cómo pudo influir eso en las personas con las que se cruzó la Garda?','这可能怎样影响警员接触到哪些人？'
 ]],
 ['People encountered', [
  'Na daoine a casadh leo','Pessoas encontradas','الأشخاص الذين جرت مقابلتهم','Napotkane osoby','Persoane întâlnite','Personnes rencontrées','Personas con las que hubo contacto','接触到的人'
 ]],
 ['Suppose Gardaí encountered 120 people in Group A and 60 in Group B.', [
  'Samhlaigh gur casadh 120 duine as Grúpa A agus 60 duine as Grúpa B leis na Gardaí.','Suponha que os agentes encontraram 120 pessoas do Grupo A e 60 do Grupo B.','افترض أن الغاردا صادفت 120 شخصًا من المجموعة أ و60 من المجموعة ب.','Załóżmy, że funkcjonariusze napotkali 120 osób z grupy A i 60 z grupy B.',
  'Presupune că polițiștii au întâlnit 120 de persoane din grupul A și 60 din grupul B.','Supposons que les Gardaí aient rencontré 120 personnes du groupe A et 60 du groupe B.','Supón que la Garda se cruzó con 120 personas del grupo A y 60 del grupo B.','假设警员接触了 A 组的 120 人和 B 组的 60 人。'
 ]],
 ['What could the reviewers compare with the number of searches?', [
  'Cad a d’fhéadfadh na hathbhreithneoirí a chur i gcomparáid le líon na gcuardach?','O que poderiam comparar com o número de buscas?','ما الذي يمكن للمراجعين مقارنته بعدد عمليات التفتيش؟','Co osoby prowadzące przegląd mogłyby porównać z liczbą przeszukań?',
  'Ce ar putea compara cei care analizează datele cu numărul de percheziții?','Que pourraient-ils comparer au nombre de fouilles ?','¿Qué podrían comparar con el número de registros?','审查人员可以把搜查次数和什么进行比较？'
 ]],
 ['Recorded reasons', [
  'Cúiseanna taifeadta','Motivos registados','الأسباب المسجلة','Zapisane powody','Motive consemnate','Motifs consignés','Motivos registrados','记录的理由'
 ]],
 ['Suppose the records give a specific reason for some searches and only a short label for others.', [
  'Samhlaigh go dtugann na taifid cúis shonrach le roinnt cuardach agus nach dtugann siad ach lipéad gairid do na cinn eile.','Suponha que os registos indicam um motivo específico para algumas buscas e apenas uma etiqueta breve para outras.','افترض أن السجلات تذكر سببًا محددًا لبعض عمليات التفتيش ووصفًا موجزًا فقط للبقية.','Załóżmy, że w dokumentacji przy części przeszukań podano konkretny powód, a przy pozostałych tylko krótką etykietę.',
  'Presupune că în evidențe apare un motiv concret pentru unele percheziții, iar pentru altele doar o etichetă scurtă.','Supposons que les dossiers indiquent un motif précis pour certaines fouilles et seulement un libellé bref pour les autres.','Supón que los registros indican un motivo concreto para algunos registros y solo una etiqueta breve para los demás.','假设记录为部分搜查列出了具体理由，其他搜查只有简短的标签。'
 ]],
 ['What would that tell them about why particular people were searched?', [
  'Cad a déarfadh sé sin leo faoin bhfáth ar cuardaíodh daoine áirithe?','O que indicaria isso sobre a razão pela qual certas pessoas foram revistadas?','ماذا سيخبرهم ذلك عن سبب تفتيش أشخاص بعينهم؟','Czego dowiedzieliby się o powodach przeszukania konkretnych osób?',
  'Ce le-ar spune asta despre motivele pentru care au fost percheziționate anumite persoane?','Qu’est-ce que cela leur apprendrait sur les raisons pour lesquelles certaines personnes ont été fouillées ?','¿Qué les diría eso sobre por qué se registró a determinadas personas?','这能帮助他们了解为何搜查了某些具体的人吗？'
 ]],
 ['What did each person know when they made their decision?', [
  'Cad a bhí ar eolas ag gach duine nuair a rinne siad a gcinneadh?','O que sabia cada pessoa quando tomou a sua decisão?','ماذا كان يعرف كل شخص عند اتخاذ قراره؟','Co wiedziała każda osoba w momencie podejmowania decyzji?',
  'Ce știa fiecare persoană când a luat decizia?','Que savait chaque personne au moment de prendre sa décision ?','¿Qué sabía cada persona al tomar su decisión?','每个人做决定时知道什么？'
 ]],
 ['What would you ask or look into next?', [
  'Cad a d’fhiafrófá nó a d’fhiosrófá ina dhiaidh sin?','O que perguntaria ou investigaria a seguir?','ما الذي ستسأل عنه أو تستقصيه بعد ذلك؟','O co zapytasz lub co sprawdzisz w następnej kolejności?',
  'Ce ai întreba sau investiga în continuare?','Que demanderiez-vous ou examineriez-vous ensuite ?','¿Qué preguntarías o examinarías a continuación?','你下一步会问什么或调查什么？'
 ]],
 ['What do the two find rates tell you, and what else would you need to know?', [
  'Cad a léiríonn an dá ráta aimsithe, agus cén t-eolas eile a bheadh ag teastáil uait?','O que revelam as duas taxas de achados e o que mais precisaria de saber?','ماذا تخبرك نسبتا العثور، وماذا تحتاج إلى معرفته أيضًا؟','Co mówią oba odsetki i czego jeszcze potrzebujesz się dowiedzieć?',
  'Ce îți arată cele două proporții și ce altceva ai mai avea nevoie să știi?','Que vous indiquent les deux taux de découverte et qu’auriez-vous encore besoin de savoir ?','¿Qué dicen las dos tasas de hallazgos y qué más necesitarías saber?','这两个查获比例告诉你什么？你还需要知道什么？'
 ]],
 ['What should the sergeant and the representative of a local community group look into together?', [
  'Cad ba chóir don sáirsint agus don ionadaí ó ghrúpa pobail áitiúil a fhiosrú le chéile?','O que devem analisar em conjunto o sargento e o representante do grupo comunitário local?','ما الذي ينبغي للرقيب وممثل المجموعة المجتمعية المحلية أن يتحريا معًا؟','Czym wspólnie powinni się zająć sierżant i przedstawiciel lokalnej grupy społecznościowej?',
  'Ce ar trebui să cerceteze împreună sergentul și reprezentantul grupului comunitar local?','Sur quoi le sergent et le représentant du groupe communautaire local devraient-ils enquêter ensemble ?','¿Qué deberían examinar juntos el sargento y el representante del grupo comunitario local?','警佐和当地社区团体代表应该一起调查什么？'
 ]]
];

// Keep the primary controls consistent with the resource's learning purpose.
const terminology = [
 ['Explore the public perspective', ['Fiosraigh dearcadh an phobail','Explorar a perspetiva do público','استكشف منظور أفراد الجمهور','Poznaj perspektywę członka społeczeństwa','Explorează perspectiva publicului','Explorer le point de vue du public','Explora la perspectiva del público','探索公众视角']],
 ['Explore the Garda perspective', ['Fiosraigh dearcadh an Gharda','Explorar a perspetiva da Garda','استكشف منظور الغاردا','Poznaj perspektywę funkcjonariusza Garda','Explorează perspectiva Garda','Explorer le point de vue de la Garda','Explora la perspectiva de la Garda','探索爱尔兰警员视角']],
 ['Exploring the public perspective', ['Ag fiosrú dhearcadh an phobail','A explorar a perspetiva do público','تستكشف منظور أفراد الجمهور','Poznajesz perspektywę członka społeczeństwa','Explorezi perspectiva publicului','Vous explorez le point de vue du public','Estás explorando la perspectiva del público','正在探索公众视角']],
 ['Exploring the Garda perspective', ['Ag fiosrú dhearcadh an Gharda','A explorar a perspetiva da Garda','تستكشف منظور الغاردا','Poznajesz perspektywę funkcjonariusza Garda','Explorezi perspectiva Garda','Vous explorez le point de vue de la Garda','Estás explorando la perspectiva de la Garda','正在探索爱尔兰警员视角']],
 ['Explore this situation', ['Fiosraigh an cás seo','Explorar esta situação','استكشف هذا الموقف','Poznaj tę sytuację','Explorează această situație','Explorer cette situation','Explora esta situación','探索这个情境']],
 ['Explore this perspective', ['Fiosraigh an dearcadh seo','Explorar esta perspetiva','استكشف هذا المنظور','Poznaj tę perspektywę','Explorează această perspectivă','Explorer ce point de vue','Explora esta perspectiva','探索这个视角']],
 ['Revisit this situation', ['Fill ar an gcás seo','Rever esta situação','عُد إلى هذا الموقف','Wróć do tej sytuacji','Revino la această situație','Revenir sur cette situation','Vuelve a esta situación','重新探索这个情境']],
 ['Revisit this decision from the public perspective', ['Fill ar an gcinneadh seo ó dhearcadh an phobail','Rever esta decisão da perspetiva do público','عُد إلى هذا القرار من منظور أفراد الجمهور','Wróć do tej decyzji z perspektywy członka społeczeństwa','Revino la această decizie din perspectiva publicului','Revenir sur cette décision du point de vue du public','Revisa esta decisión desde la perspectiva del público','从公众视角重新审视这个决定']],
 ['Revisit this decision from the Garda perspective', ['Fill ar an gcinneadh seo ó dhearcadh an Gharda','Rever esta decisão da perspetiva da Garda','عُد إلى هذا القرار من منظور الغاردا','Wróć do tej decyzji z perspektywy funkcjonariusza Garda','Revino la această decizie din perspectiva Garda','Revenir sur cette décision du point de vue de la Garda','Revisa esta decisión desde la perspectiva de la Garda','从爱尔兰警员视角重新审视这个决定']],
 ['Resume your situation', ['Lean le do chás','Continuar a sua situação','تابع موقفك','Kontynuuj swoją sytuację','Continuă situația','Reprendre votre situation','Continúa tu situación','继续当前情境']],
 ['Ways to explore', ['Bealaí le fiosrú','Formas de explorar','طرق الاستكشاف','Sposoby poznawania sytuacji','Moduri de explorare','Façons d’explorer','Formas de explorar','探索方式']],
 ['Choose a perspective', ['Roghnaigh dearcadh','Escolha uma perspetiva','اختر منظورًا','Wybierz perspektywę','Alege o perspectivă','Choisissez un point de vue','Elige una perspectiva','选择一个视角']],
 ['Explore and discuss this situation', ['Fiosraigh agus pléigh an cás seo','Explore e discuta esta situação','استكشف هذا الموقف وناقشه','Poznaj i omów tę sytuację','Explorează și discută această situație','Explorer et discuter de cette situation','Explora y comenta esta situación','探索并讨论这个情境']],
 ['Choose a participant. Other people can follow along as observers.', ['Roghnaigh rannpháirtí. Is féidir le daoine eile breathnú agus an cás a leanúint.','Escolha um participante. As outras pessoas podem acompanhar como observadoras.','اختر مشاركًا. يمكن للآخرين المتابعة بصفة مراقبين.','Wybierz uczestnika. Pozostałe osoby mogą śledzić sytuację jako obserwatorzy.','Alege un participant. Celelalte persoane pot urmări ca observatori.','Choisissez une personne participante. Les autres peuvent suivre en tant qu’observateurs.','Elige a una persona participante. Las demás pueden seguir la situación como observadoras.','选择一位参与者。其他人可以作为观察者跟随情境。']],
 ['An interactive learning resource for the public and Gardaí.', ['Áis foghlama idirghníomhach don phobal agus do na Gardaí.','Um recurso de aprendizagem interativo para o público e para a Garda.','مورد تعليمي تفاعلي لأفراد الجمهور وعناصر الغاردا.','Interaktywny materiał edukacyjny dla społeczeństwa i funkcjonariuszy Garda.','O resursă interactivă de învățare pentru public și membrii Garda.','Une ressource pédagogique interactive pour le public et les membres de la Garda.','Un recurso de aprendizaje interactivo para el público y los miembros de la Garda.','面向公众与爱尔兰警员的互动学习资源。']],
 ['Skip to the learning content', ['Léim chuig an ábhar foghlama','Saltar para o conteúdo de aprendizagem','انتقل إلى المحتوى التعليمي','Przejdź do materiałów edukacyjnych','Sari la conținutul de învățare','Aller au contenu pédagogique','Ir al contenido de aprendizaje','跳至学习内容']],
 ['START EXPLORING', ['TOSAIGH AG FIOSRÚ','COMEÇAR A EXPLORAR','ابدأ الاستكشاف','ZACZNIJ POZNAWAĆ','ÎNCEPE EXPLORAREA','COMMENCER À EXPLORER','EMPIEZA A EXPLORAR','开始探索']],
 ['EXPLORE BOTH PERSPECTIVES', ['FIOSRAIGH AN DÁ DHEARCADH','EXPLORE AS DUAS PERSPETIVAS','استكشف المنظورين','POZNAJ OBIE PERSPEKTYWY','EXPLOREAZĂ AMBELE PERSPECTIVE','EXPLOREZ LES DEUX POINTS DE VUE','EXPLORA AMBAS PERSPECTIVAS','探索双方视角']],
 ['No timer. You can change character or switch sides as you explore.', ['Gan teorainn ama. Is féidir carachtar nó dearcadh a athrú agus tú ag fiosrú.','Sem limite de tempo. Pode mudar de personagem ou de perspetiva enquanto explora.','لا يوجد حد زمني. يمكنك تغيير الشخصية أو المنظور أثناء الاستكشاف.','Bez limitu czasu. Podczas poznawania sytuacji możesz zmienić postać lub perspektywę.','Fără limită de timp. Poți schimba personajul sau perspectiva pe măsură ce explorezi.','Sans limite de temps. Vous pouvez changer de personnage ou de point de vue pendant l’exploration.','Sin límite de tiempo. Puedes cambiar de personaje o de perspectiva mientras exploras.','没有时间限制。探索过程中，你可以更换角色形象或切换视角。']],
 ["Explore fictional situations involving members of the public and Gardaí. Choose a response, then reflect on the human and civil rights, police powers and responsibilities involved.", ["Fiosraigh cásanna ficseanúla ina mbíonn daoine den phobal agus Gardaí páirteach. Roghnaigh freagra, ansin déan machnamh ar na cearta daonna agus sibhialta, na cumhachtaí agus na freagrachtaí atá i gceist.","Explore situações fictícias que envolvem membros do público e agentes da Garda. Escolha uma resposta e reflita sobre os direitos humanos e civis, poderes e responsabilidades envolvidos.","استكشف مواقف خيالية تضم أفرادًا من الجمهور وعناصر الغاردا. اختر استجابة، ثم تأمل حقوق الإنسان والحقوق المدنية والصلاحيات والمسؤوليات ذات الصلة.","Poznaj fikcyjne sytuacje z udziałem członków społeczeństwa i funkcjonariuszy Garda. Wybierz reakcję, a następnie zastanów się nad związanymi z nią prawami człowieka i prawami obywatelskimi, uprawnieniami i obowiązkami.","Explorează situații fictive care implică membri ai publicului și ai Garda. Alege un răspuns, apoi reflectează asupra drepturilor omului și drepturilor civile, puterilor și responsabilităților implicate.","Explorez des situations fictives impliquant des membres du public et de la Garda. Choisissez une réponse, puis réfléchissez aux droits humains et civils, aux pouvoirs et aux responsabilités en jeu.","Explora situaciones ficticias entre miembros del público y de la Garda. Elige una respuesta y reflexiona sobre los derechos humanos y civiles, las facultades y las responsabilidades en juego.","探索公众与爱尔兰警员之间的虚构情境。选择一种回应，然后思考其中涉及的人权和公民权利、权力与责任。"]]
];
const communityResearch = [
 [
  "PABI · community research",
  [
   "PABI · taighde pobail",
   "PABI · investigação comunitária",
   "PABI · بحث مجتمعي",
   "PABI · badania społeczności",
   "PABI · cercetare comunitară",
   "PABI · recherche auprès des communautés",
   "PABI · investigación comunitaria",
   "PABI · 社群研究"
  ]
 ],
 [
  "Research report",
  [
   "Tuarascáil taighde",
   "Relatório de investigação",
   "تقرير بحثي",
   "Raport z badań",
   "Raport de cercetare",
   "Rapport de recherche",
   "Informe de investigación",
   "研究报告"
  ]
 ],
 [
  "Executive summary, methodology and selected findings reviewed",
  [
   "Rinneadh athbhreithniú ar an achoimre feidhmiúcháin, ar an modheolaíocht agus ar thorthaí roghnaithe",
   "Resumo executivo, metodologia e resultados selecionados consultados",
   "تمت مراجعة الملخص التنفيذي والمنهجية ونتائج مختارة",
   "Przeanalizowano streszczenie, metodologię i wybrane wyniki",
   "Au fost consultate rezumatul executiv, metodologia și anumite rezultate",
   "Résumé, méthodologie et certains résultats examinés",
   "Se revisaron el resumen ejecutivo, la metodología y una selección de resultados",
   "已审阅执行摘要、研究方法和部分研究结果"
  ]
 ],
 [
  "Research on policing experiences, racial profiling, trust, reporting crime and complaints among Brazilians and people of African descent in Ireland.",
  [
   "Taighde ar eispéiris póilíneachta, próifíliú ciníoch, muinín, tuairisciú coireachta agus gearáin i measc Brasaíleach agus daoine de shliocht na hAfraice in Éirinn.",
   "Investigação sobre experiências com a polícia, perfilamento racial, confiança, denúncia de crimes e queixas entre brasileiros e pessoas de ascendência africana na Irlanda.",
   "بحث حول تجارب التعامل مع الشرطة والتنميط العنصري والثقة والإبلاغ عن الجرائم والشكاوى لدى البرازيليين والأشخاص المنحدرين من أصول أفريقية في أيرلندا.",
   "Badania dotyczące kontaktów z policją, profilowania rasowego, zaufania, zgłaszania przestępstw i skarg wśród Brazylijczyków i osób pochodzenia afrykańskiego w Irlandii.",
   "Cercetare privind experiențele cu poliția, profilarea rasială, încrederea, raportarea infracțiunilor și plângerile în rândul brazilienilor și al persoanelor de origine africană din Irlanda.",
   "Recherche sur les expériences avec la police, le profilage racial, la confiance, le signalement des infractions et les plaintes parmi les personnes brésiliennes et d’ascendance africaine en Irlande.",
   "Investigación sobre experiencias con la policía, perfilamiento racial, confianza, denuncia de delitos y quejas entre personas brasileñas y de ascendencia africana en Irlanda.",
   "研究巴西裔和非洲裔人士在爱尔兰与警方接触的经历、种族定性、信任、报案和投诉。"
  ]
 ],
 [
  "The survey was small and self-selecting. Participants’ accounts do not estimate national prevalence or decide an individual case. This research does not set out current legal powers or evaluate this resource.",
  [
   "Bhí an suirbhé beag agus roghnaigh na rannpháirtithe iad féin le bheith páirteach ann. Ní thugann a gcuntais meastachán ar leitheadúlacht náisiúnta ná breithiúnas ar chás aonair. Ní leagtar amach sa taighde seo na cumhachtaí dlíthiúla reatha ná ní dhéantar measúnú ar an áis seo.",
   "O inquérito foi pequeno e de participação voluntária. Os relatos dos participantes não permitem estimar a prevalência nacional nem decidir um caso individual. Esta investigação não apresenta os poderes legais atuais nem avalia este recurso.",
   "كان الاستطلاع صغيرًا واختار المشاركون الانضمام إليه بأنفسهم. لا تقدّر رواياتهم مدى الانتشار على المستوى الوطني ولا تحسم حالة فردية. لا يبيّن هذا البحث الصلاحيات القانونية الحالية ولا يقيّم هذا المورد.",
   "Ankieta była niewielka, a uczestnicy sami zgłaszali się do udziału. Ich relacje nie pozwalają oszacować skali zjawiska w kraju ani rozstrzygnąć indywidualnej sprawy. Badanie nie przedstawia aktualnych uprawnień prawnych ani nie ocenia tego materiału edukacyjnego.",
   "Sondajul a fost mic, iar participanții s-au înscris din proprie inițiativă. Relatările lor nu estimează prevalența la nivel național și nu soluționează un caz individual. Cercetarea nu prezintă puterile legale actuale și nu evaluează această resursă.",
   "L’enquête était de petite taille et les personnes ont choisi d’y participer. Leurs témoignages ne permettent ni d’estimer la prévalence nationale ni de trancher un cas individuel. Cette recherche ne présente pas les pouvoirs légaux actuels et n’évalue pas cette ressource.",
   "La encuesta fue pequeña y las personas decidieron participar por iniciativa propia. Sus relatos no permiten estimar la prevalencia nacional ni resolver un caso individual. Esta investigación no expone las facultades legales actuales ni evalúa este recurso.",
   "调查规模较小，参与者自行选择参加。他们的陈述不能用于估计全国发生率，也不能判定个案。本研究没有列明现行法律权力，也没有评估本学习资源。"
  ]
 ],
 [
  "Examine respectful treatment, barriers to seeking help and community-informed review alongside legal and statistical sources.",
  [
   "Scrúdaigh caitheamh measúil, bacainní ar chabhair a lorg agus athbhreithniú a chuireann tuairimí an phobail san áireamh, in éineacht le foinsí dlíthiúla agus staitistiúla.",
   "Examine o tratamento respeitoso, os obstáculos à procura de ajuda e a revisão com contributos da comunidade, em conjunto com fontes jurídicas e estatísticas.",
   "ادرس المعاملة باحترام والعوائق أمام طلب المساعدة والمراجعة المستندة إلى آراء المجتمع، إلى جانب المصادر القانونية والإحصائية.",
   "Analizuj pełne szacunku traktowanie, bariery w szukaniu pomocy i przegląd uwzględniający głos społeczności, korzystając również ze źródeł prawnych i statystycznych.",
   "Examinează tratamentul respectuos, obstacolele în solicitarea ajutorului și analiza care ține cont de comunitate, alături de surse juridice și statistice.",
   "Examiner le traitement respectueux, les obstacles à la recherche d’aide et l’évaluation tenant compte des communautés, en parallèle des sources juridiques et statistiques.",
   "Examina el trato respetuoso, las barreras para pedir ayuda y la revisión que incorpora las aportaciones de la comunidad, junto con fuentes jurídicas y estadísticas.",
   "结合法律和统计资料，探讨尊重他人的对待方式、求助障碍以及听取社群意见的审查。"
  ]
 ],
 [
  "Project information and report summaries in several languages.",
  [
   "Eolas faoin tionscadal agus achoimrí ar an tuarascáil i roinnt teangacha.",
   "Informações sobre o projeto e resumos do relatório em várias línguas.",
   "معلومات عن المشروع وملخصات التقرير بعدة لغات.",
   "Informacje o projekcie i streszczenia raportu w kilku językach.",
   "Informații despre proiect și rezumate ale raportului în mai multe limbi.",
   "Informations sur le projet et résumés du rapport en plusieurs langues.",
   "Información sobre el proyecto y resúmenes del informe en varios idiomas.",
   "项目信息和多种语言的报告摘要。"
  ]
 ],
 [
  "The 2025 PABI report adds research on policing experiences, trust and barriers to reporting among Brazilians and people of African descent in Ireland. It supports attention to community experience; it does not evaluate this resource.",
  [
   "Cuireann tuarascáil PABI 2025 taighde ar fáil ar eispéiris póilíneachta, ar mhuinín agus ar bhacainní ar thuairisciú i measc Brasaíleach agus daoine de shliocht na hAfraice in Éirinn. Tacaíonn sé le haird a thabhairt ar eispéiris an phobail; ní dhéanann sé measúnú ar an áis seo.",
   "O relatório PABI de 2025 acrescenta investigação sobre experiências com a polícia, confiança e obstáculos à denúncia entre brasileiros e pessoas de ascendência africana na Irlanda. Apoia a atenção às experiências da comunidade; não avalia este recurso.",
   "يضيف تقرير PABI لعام 2025 بحثًا حول تجارب التعامل مع الشرطة والثقة والعوائق أمام الإبلاغ لدى البرازيليين والأشخاص المنحدرين من أصول أفريقية في أيرلندا. وهو يدعم الاهتمام بتجارب المجتمع، لكنه لا يقيّم هذا المورد.",
   "Raport PABI z 2025 roku uzupełnia badania dotyczące kontaktów z policją, zaufania i barier w zgłaszaniu zdarzeń wśród Brazylijczyków i osób pochodzenia afrykańskiego w Irlandii. Wspiera uwzględnianie doświadczeń społeczności; nie ocenia tego materiału edukacyjnego.",
   "Raportul PABI din 2025 adaugă cercetare privind experiențele cu poliția, încrederea și obstacolele în raportare în rândul brazilienilor și al persoanelor de origine africană din Irlanda. Susține atenția acordată experiențelor comunității; nu evaluează această resursă.",
   "Le rapport PABI de 2025 apporte des recherches sur les expériences avec la police, la confiance et les obstacles au signalement parmi les personnes brésiliennes et d’ascendance africaine en Irlande. Il invite à tenir compte de l’expérience des communautés ; il n’évalue pas cette ressource.",
   "El informe PABI de 2025 aporta investigación sobre experiencias con la policía, confianza y barreras para denunciar entre personas brasileñas y de ascendencia africana en Irlanda. Apoya la atención a las experiencias de la comunidad; no evalúa este recurso.",
   "2025 年的 PABI 报告补充了关于巴西裔和非洲裔人士在爱尔兰与警方接触的经历、信任及报案障碍的研究。它支持关注社群经历，但没有评估本学习资源。"
  ]
 ],
 [
  "Read the PABI report (PDF)",
  [
   "Léigh tuarascáil PABI (PDF)",
   "Ler o relatório PABI (PDF)",
   "اقرأ تقرير PABI ‏(PDF)",
   "Przeczytaj raport PABI (PDF)",
   "Citește raportul PABI (PDF)",
   "Lire le rapport PABI (PDF)",
   "Lee el informe PABI (PDF)",
   "阅读 PABI 报告（PDF）"
  ]
 ],
 [
  "PABI project and multilingual summaries",
  [
   "Tionscadal PABI agus achoimrí i roinnt teangacha",
   "Projeto PABI e resumos multilingues",
   "مشروع PABI وملخصات متعددة اللغات",
   "Projekt PABI i wielojęzyczne streszczenia",
   "Proiectul PABI și rezumate multilingve",
   "Projet PABI et résumés multilingues",
   "Proyecto PABI y resúmenes multilingües",
   "PABI 项目和多语言摘要"
  ]
 ]
];
const contributionCopy = [
 ['Community voices and independent expertise could help shape the next version.', [
  'D’fhéadfadh guthanna pobail agus saineolas neamhspleách cuidiú leis an gcéad leagan eile a mhúnlú.',
  'As vozes das comunidades e os conhecimentos independentes poderão ajudar a melhorar a próxima versão.',
  'يمكن لأصوات المجتمعات والخبرات المستقلة أن تسهم في تطوير النسخة القادمة.',
  'Głosy społeczności i niezależna wiedza mogą pomóc w opracowaniu kolejnej wersji.',
  'Vocile comunităților și expertiza independentă ar putea contribui la dezvoltarea următoarei versiuni.',
  'Les voix des communautés et une expertise indépendante pourraient contribuer à la prochaine version.',
  'Las voces de las comunidades y los conocimientos independientes podrían ayudar a desarrollar la próxima versión.',
  '社区的声音和独立专业意见可以帮助完善下一个版本。'
 ]],
 ['How input could help', ['Conas a d’fhéadfadh ionchur cuidiú','Como os contributos poderão ajudar','كيف يمكن للمساهمات أن تساعد','Jak mogą pomóc uwagi i sugestie','Cum ar putea ajuta contribuțiile','Comment les contributions pourraient aider','Cómo podrían ayudar las aportaciones','意见可以如何提供帮助']],
 ['Review legal wording, powers and sources.', [
  'Athbhreithniú a dhéanamh ar an bhfoclaíocht dhlíthiúil, ar chumhachtaí agus ar fhoinsí.',
  'Rever a redação jurídica, os poderes e as fontes.',
  'مراجعة الصياغة القانونية والصلاحيات والمصادر.',
  'Przegląd sformułowań prawnych, uprawnień i źródeł.',
  'Revizuirea formulărilor juridice, a atribuțiilor și a surselor.',
  'Revoir les formulations juridiques, les pouvoirs et les sources.',
  'Revisar la redacción jurídica, las facultades y las fuentes.',
  '审查法律措辞、权限和资料来源。'
 ]],
 ['Shape realistic situations with people affected.', [
  'Cásanna réalaíocha a mhúnlú in éineacht leis na daoine lena mbaineann.',
  'Criar situações realistas com as pessoas afetadas.',
  'صياغة مواقف واقعية بمشاركة الأشخاص المتأثرين.',
  'Tworzenie realistycznych sytuacji wspólnie z osobami, których one dotyczą.',
  'Crearea unor situații realiste împreună cu persoanele afectate.',
  'Créer des situations réalistes avec les personnes concernées.',
  'Crear situaciones realistas con las personas afectadas.',
  '与受影响的人共同设计贴近实际的情境。'
 ]],
 ['Test accessibility and review translations.', [
  'Inrochtaineacht a thástáil agus aistriúcháin a athbhreithniú.',
  'Testar a acessibilidade e rever as traduções.',
  'اختبار إمكانية الوصول ومراجعة الترجمات.',
  'Testowanie dostępności i weryfikacja tłumaczeń.',
  'Testarea accesibilității și revizuirea traducerilor.',
  'Tester l’accessibilité et revoir les traductions.',
  'Probar la accesibilidad y revisar las traducciones.',
  '测试无障碍功能并审核翻译。'
 ]],
 ['Develop facilitated learning and evaluate its impact.', [
  'Foghlaim faoi threoir éascaitheora a fhorbairt agus a tionchar a mheas.',
  'Desenvolver atividades com facilitadores e avaliar o seu impacto.',
  'تطوير التعلم بإشراف ميسّر وتقييم أثره.',
  'Rozwijanie zajęć prowadzonych przez moderatora i ocena ich wpływu.',
  'Dezvoltarea învățării cu facilitator și evaluarea impactului acesteia.',
  'Développer des activités accompagnées et évaluer leurs effets.',
  'Desarrollar actividades guiadas y evaluar su impacto.',
  '开发由引导者带领的学习活动并评估其效果。'
 ]],
 ['Priorities for further development', ['Tosaíochtaí don fhorbairt bhreise','Prioridades para o desenvolvimento futuro','أولويات التطوير المستقبلي','Priorytety dalszego rozwoju','Priorități pentru dezvoltarea viitoare','Priorités de développement','Prioridades para el desarrollo futuro','后续开发重点']],
 ['Traveller and Roma perspectives.', ['Dearcthaí an Lucht Siúil agus na Romach.','Perspetivas das comunidades Traveller e Roma.','وجهات نظر مجتمعات الترافيلر والروما.','Perspektywy społeczności Travellers i Romów.','Perspectivele comunităților Traveller și rome.','Perspectives des communautés Travellers et roms.','Perspectivas de las comunidades Traveller y romaní.','爱尔兰旅行者社群和罗姆人的视角。']],
 ['Disability and communication needs.', ['Míchumas agus riachtanais chumarsáide.','Deficiência e necessidades de comunicação.','الإعاقة واحتياجات التواصل.','Niepełnosprawność i potrzeby komunikacyjne.','Dizabilitate și nevoi de comunicare.','Handicap et besoins de communication.','Discapacidad y necesidades de comunicación.','残障与沟通需求。']],
 ['Immigration and border contexts.', ['Comhthéacsanna inimirce agus teorann.','Contextos de imigração e de fronteira.','سياقات الهجرة والحدود.','Sytuacje związane z imigracją i granicami.','Contexte de imigrație și de frontieră.','Situations liées à l’immigration et aux frontières.','Contextos de inmigración y fronteras.','移民与边境相关情境。']],
 ['Facilitator-led learning.', ['Foghlaim faoi threoir éascaitheora.','Aprendizagem com facilitadores.','التعلم بإشراف ميسّر.','Zajęcia prowadzone przez moderatora.','Învățare cu facilitator.','Apprentissage accompagné.','Aprendizaje guiado.','由引导者带领的学习。']],
 ['Potential contributors', ['Rannpháirtithe féideartha','Possíveis colaboradores','جهات محتملة للمساهمة','Potencjalni współtwórcy','Posibili colaboratori','Contributeurs potentiels','Posibles colaboradores','潜在贡献者']],
 ['Examples of organisations and institutions to approach, alongside people with lived experience:', [
  'Samplaí d’eagraíochtaí agus d’institiúidí a bhféadfaí teagmháil a dhéanamh leo, in éineacht le daoine a bhfuil taithí phearsanta acu:',
  'Exemplos de organizações e instituições a contactar, juntamente com pessoas com experiência vivida:',
  'أمثلة على منظمات ومؤسسات يمكن التواصل معها، إلى جانب أشخاص لديهم تجارب مباشرة:',
  'Przykłady organizacji i instytucji, do których można się zwrócić, obok osób z własnym doświadczeniem:',
  'Exemple de organizații și instituții care ar putea fi contactate, alături de persoane cu experiență directă:',
  'Exemples d’organisations et d’institutions à solliciter, aux côtés de personnes ayant une expérience vécue :',
  'Ejemplos de organizaciones e instituciones a las que se podría acudir, junto con personas con experiencia directa:',
  '以下是可考虑联系的组织和机构，同时也应听取有亲身经历者的意见：'
 ]],
 ['Human and Civil Rights and legal review', ['Cearta Daonna agus Sibhialta agus athbhreithniú dlíthiúil','Direitos humanos e civis e revisão jurídica','حقوق الإنسان والحقوق المدنية والمراجعة القانونية','Prawa człowieka, prawa obywatelskie i przegląd prawny','Drepturile omului, drepturile civile și revizuirea juridică','Droits humains et civils et examen juridique','Derechos humanos y civiles y revisión jurídica','人权、公民权利与法律审查']],
 ['Practising Irish solicitors', ['Aturnaetha cleachtacha in Éirinn','Solicitadores e advogados em exercício na Irlanda','محامون ممارسون في أيرلندا','Praktykujący prawnicy w Irlandii','Avocați practicanți în Irlanda','Avocats en exercice en Irlande','Profesionales de la abogacía en ejercicio en Irlanda','在爱尔兰执业的事务律师']],
 ['Anti-racism and community experience', ['Frithchiníochas agus taithí an phobail','Antirracismo e experiência das comunidades','مناهضة العنصرية وتجارب المجتمعات','Przeciwdziałanie rasizmowi i doświadczenia społeczności','Antirasism și experiența comunităților','Antiracisme et expérience des communautés','Antirracismo y experiencia de las comunidades','反种族主义与社区经历']],
 ['Young people and community learning', ['Daoine óga agus foghlaim phobail','Jovens e aprendizagem comunitária','الشباب والتعلم المجتمعي','Młodzież i edukacja społecznościowa','Tineri și învățare comunitară','Jeunes et apprentissage communautaire','Jóvenes y aprendizaje comunitario','青年与社区学习']],
 ['Disability, accessibility and communication', ['Míchumas, inrochtaineacht agus cumarsáid','Deficiência, acessibilidade e comunicação','الإعاقة وإمكانية الوصول والتواصل','Niepełnosprawność, dostępność i komunikacja','Dizabilitate, accesibilitate și comunicare','Handicap, accessibilité et communication','Discapacidad, accesibilidad y comunicación','残障、无障碍与沟通']],
 ['Immigration and migrant perspectives', ['Inimirce agus dearcthaí imirceach','Imigração e perspetivas dos migrantes','الهجرة ووجهات نظر المهاجرين','Imigracja i perspektywy migrantów','Imigrație și perspectivele migranților','Immigration et perspectives des migrants','Inmigración y perspectivas de las personas migrantes','移民事务与移民群体的视角']],
 ['Garda education and independent research', ['Oideachas na nGardaí agus taighde neamhspleách','Formação da Garda e investigação independente','تعليم أفراد الشرطة الأيرلندية والبحث المستقل','Szkolenie Garda i niezależne badania','Formarea Garda și cercetare independentă','Formation de la Garda et recherche indépendante','Formación de la Garda e investigación independiente','爱尔兰警察教育与独立研究']],
 ['An invitation for input', ['Cuireadh chun ionchur a thabhairt','Um convite a contribuir','دعوة للمساهمة','Zaproszenie do współtworzenia','O invitație la contribuții','Une invitation à contribuer','Una invitación a contribuir','诚邀提供意见']],
 ['These are potential contributions and future priorities. No partnership, endorsement or commitment is claimed. This work has not been commissioned or completed.', [
  'Is rannchuidithe féideartha agus tosaíochtaí don todhchaí iad seo. Ní mhaítear aon chomhpháirtíocht, formhuiniú ná gealltanas. Níor coimisiúnaíodh ná níor críochnaíodh an obair seo.',
  'Estas são possíveis contribuições e prioridades futuras. Não se afirma qualquer parceria, apoio ou compromisso. Este trabalho não foi encomendado nem concluído.',
  'هذه مساهمات محتملة وأولويات مستقبلية. لا يُدّعى وجود أي شراكة أو تأييد أو التزام. لم يتم التكليف بهذا العمل أو إنجازه.',
  'Są to możliwe formy wkładu i przyszłe priorytety. Nie deklaruje się żadnego partnerstwa, poparcia ani zobowiązania. Prace te nie zostały zlecone ani ukończone.',
  'Acestea sunt contribuții posibile și priorități viitoare. Nu se pretinde existența vreunui parteneriat, a vreunei aprobări sau a vreunui angajament. Această activitate nu a fost comandată sau finalizată.',
  'Il s’agit de contributions possibles et de priorités futures. Aucun partenariat, soutien ou engagement n’est revendiqué. Ce travail n’a pas été commandé ni achevé.',
  'Se trata de posibles aportaciones y prioridades futuras. No se afirma que exista ninguna colaboración, respaldo o compromiso. Este trabajo no ha sido encargado ni completado.',
  '以上为可能的贡献和未来重点，不代表已建立任何合作、获得认可或作出承诺。这些工作尚未受委托开展，也尚未完成。'
 ]]
];
const additionalContributorLabels = [
 ['Gender, sexual orientation and age', ['Inscne, claonadh gnéasach agus aois','Género, orientação sexual e idade','النوع الاجتماعي والتوجه الجنسي والعمر','Płeć, orientacja seksualna i wiek','Gen, orientare sexuală și vârstă','Genre, orientation sexuelle et âge','Género, orientación sexual y edad','性别、性取向与年龄']],
 ['Policing oversight and accountability', ['Maoirseacht agus cuntasacht póilíneachta','Supervisão policial e responsabilização','الرقابة على الشرطة والمساءلة','Nadzór nad policją i odpowiedzialność','Supravegherea poliției și răspunderea','Contrôle de la police et responsabilité','Supervisión policial y rendición de cuentas','警务监督与问责']],
 ['Policy research and think tanks', ['Taighde beartais agus meithleacha smaointe','Investigação de políticas e centros de reflexão','بحوث السياسات ومراكز الفكر','Badania polityk publicznych i ośrodki analityczne','Cercetare de politici publice și centre de analiză','Recherche sur les politiques publiques et groupes de réflexion','Investigación de políticas públicas y centros de pensamiento','政策研究与智库']]
];
const communityResourceCopy = [
 ['Complaints', ['Gearáin','Reclamações','الشكاوى','Skargi','Plângeri','Réclamations','Reclamaciones','投诉']],
 ['Community experiences', ['Eispéiris phobail','Experiências das comunidades','تجارب المجتمعات','Doświadczenia społeczności','Experiențele comunităților','Expériences des communautés','Experiencias de las comunidades','社区经历']],
 ['Academic article on Traveller-police relations, accommodation and the policing of public space. The publisher provides an abstract; full text may require access.', [
  'Alt acadúil ar chaidreamh an Lucht Siúil leis na póilíní, ar chóiríocht agus ar phóilíneacht spásanna poiblí. Tá achoimre ar fáil ón bhfoilsitheoir; d’fhéadfadh rochtain ar leith a bheith ag teastáil don téacs iomlán.',
  'Artigo académico sobre as relações entre Travellers e polícia, alojamento e policiamento do espaço público. A editora disponibiliza um resumo; o texto integral pode exigir acesso.',
  'مقال أكاديمي عن علاقة مجتمع الترافيلر بالشرطة والسكن ومراقبة الأماكن العامة. يتيح الناشر ملخصًا؛ وقد يتطلب النص الكامل صلاحية وصول.',
  'Artykuł naukowy o relacjach Travellers z policją, zakwaterowaniu i kontroli przestrzeni publicznej. Wydawca udostępnia streszczenie; pełny tekst może wymagać dostępu.',
  'Articol academic despre relațiile comunității Traveller cu poliția, locuire și controlul spațiului public. Editura oferă un rezumat; textul integral poate necesita acces.',
  'Article universitaire sur les relations entre Travellers et police, le logement et le contrôle de l’espace public. Un résumé est disponible ; le texte intégral peut nécessiter un accès.',
  'Artículo académico sobre las relaciones entre Travellers y policía, el alojamiento y el control del espacio público. La editorial ofrece un resumen; el texto completo puede requerir acceso.',
  '关于爱尔兰旅行者社群与警察的关系、住房和公共空间警务的学术文章。出版商提供摘要，阅读全文可能需要访问权限。'
 ]],
 ['University research documenting Travellers’ accounts of Garda stops, searches, custody and access to justice in Ireland.', [
  'Taighde ollscoile a dhoiciméadaíonn cuntais an Lucht Siúil ar stopanna, cuardaigh, coimeád agus rochtain ar cheartas in Éirinn.',
  'Investigação universitária que documenta relatos de Travellers sobre abordagens, buscas, detenção e acesso à justiça na Irlanda.',
  'بحث جامعي يوثّق روايات الترافيلر عن الاستيقاف والتفتيش والاحتجاز والوصول إلى العدالة في أيرلندا.',
  'Badanie uniwersyteckie dokumentujące relacje Travellers o zatrzymaniach, przeszukaniach, pobycie w areszcie i dostępie do wymiaru sprawiedliwości w Irlandii.',
  'Cercetare universitară care documentează relatările comunității Traveller despre opriri, percheziții, reținere și accesul la justiție în Irlanda.',
  'Recherche universitaire documentant les récits des Travellers sur les contrôles, les fouilles, la garde à vue et l’accès à la justice en Irlande.',
  'Investigación universitaria que documenta relatos de Travellers sobre controles, registros, detención y acceso a la justicia en Irlanda.',
  '大学研究记录了爱尔兰旅行者社群对警察拦查、搜查、羁押及获得司法救济的经历描述。'
 ]],
 ['Historical ethnography of Garda culture and interactions with immigrant minority communities. The author also created this resource; full-book access may require a subscription.', [
  'Eitneagrafaíocht stairiúil ar chultúr na nGardaí agus ar theagmhálacha le pobail mhionlaigh inimirceacha. Chruthaigh an t-údar an acmhainn seo freisin; d’fhéadfadh síntiús a bheith ag teastáil don leabhar iomlán.',
  'Etnografia histórica da cultura da Garda e das interações com comunidades minoritárias imigrantes. O autor também criou este recurso; o livro completo pode exigir uma subscrição.',
  'دراسة إثنوغرافية تاريخية لثقافة الشرطة الأيرلندية وتفاعلها مع مجتمعات الأقليات المهاجرة. أنشأ المؤلف هذا المورد أيضًا؛ وقد يتطلب الكتاب الكامل اشتراكًا.',
  'Historyczna etnografia kultury Garda i kontaktów z mniejszościowymi społecznościami imigrantów. Autor stworzył również ten materiał; pełna książka może wymagać subskrypcji.',
  'Etnografie istorică a culturii Garda și a interacțiunilor cu comunitățile minoritare de imigranți. Autorul a creat și această resursă; accesul la cartea integrală poate necesita abonament.',
  'Ethnographie historique de la culture de la Garda et de ses interactions avec les minorités immigrées. L’auteur a aussi créé cette ressource ; le livre intégral peut nécessiter un abonnement.',
  'Etnografía histórica de la cultura de la Garda y sus interacciones con comunidades minoritarias inmigrantes. El autor también creó este recurso; el libro completo puede requerir una suscripción.',
  '关于爱尔兰警察文化及其与移民少数群体互动的历史民族志研究。作者也是本学习资源的创建者；阅读全文可能需要订阅。'
 ]],
 ['University research on disabled and Deaf people’s experiences of safety, reporting incidents and communication with Gardaí in Ireland.', [
  'Taighde ollscoile ar eispéiris daoine faoi mhíchumas agus daoine Bodhra maidir le sábháilteacht, teagmhais a thuairisciú agus cumarsáid leis na Gardaí in Éirinn.',
  'Investigação universitária sobre segurança, denúncia de incidentes e comunicação com a Garda entre pessoas com deficiência e pessoas surdas na Irlanda.',
  'بحث جامعي عن تجارب الأشخاص ذوي الإعاقة والصم في السلامة والإبلاغ عن الحوادث والتواصل مع الشرطة الأيرلندية.',
  'Badanie uniwersyteckie o doświadczeniach osób z niepełnosprawnościami i osób Głuchych dotyczących bezpieczeństwa, zgłaszania incydentów i komunikacji z Garda w Irlandii.',
  'Cercetare universitară despre experiențele persoanelor cu dizabilități și ale persoanelor surde privind siguranța, raportarea incidentelor și comunicarea cu Garda în Irlanda.',
  'Recherche universitaire sur les expériences des personnes handicapées et sourdes concernant la sécurité, le signalement d’incidents et la communication avec la Garda en Irlande.',
  'Investigación universitaria sobre seguridad, denuncia de incidentes y comunicación con la Garda entre personas con discapacidad y personas sordas en Irlanda.',
  '大学研究探讨爱尔兰残障人士及聋人在安全、报告事件和与警察沟通方面的经历。'
 ]],
 ['University report combining an international review with a Dublin roundtable involving representatives of marginalised communities and statutory agencies.', [
  'Tuarascáil ollscoile a chomhcheanglaíonn athbhreithniú idirnáisiúnta le comhphlé i mBaile Átha Cliath idir ionadaithe pobail imeallaithe agus gníomhaireachtaí reachtúla.',
  'Relatório universitário que combina uma revisão internacional com uma mesa-redonda em Dublin entre representantes de comunidades marginalizadas e entidades públicas.',
  'تقرير جامعي يجمع بين مراجعة دولية ومائدة مستديرة في دبلن بمشاركة ممثلي المجتمعات المهمشة والهيئات القانونية العامة.',
  'Raport uniwersytecki łączący przegląd międzynarodowy z debatą w Dublinie z udziałem przedstawicieli społeczności marginalizowanych i instytucji publicznych.',
  'Raport universitar care combină o analiză internațională cu o masă rotundă la Dublin, cu reprezentanți ai comunităților marginalizate și ai instituțiilor publice.',
  'Rapport universitaire associant une revue internationale à une table ronde à Dublin avec des représentants de communautés marginalisées et d’organismes publics.',
  'Informe universitario que combina una revisión internacional con una mesa redonda en Dublín con representantes de comunidades marginadas y organismos públicos.',
  '大学报告结合国际文献综述和都柏林圆桌讨论，参与者包括边缘化社区代表和法定机构。'
 ]],
 ['Traveller and Roma advocacy briefing on over-policing, protection from crime, trust and participation in policing decisions.', [
  'Cáipéis abhcóideachta don Lucht Siúil agus do na Romaigh ar ró-phóilíneacht, cosaint ar choireacht, muinín agus rannpháirtíocht i gcinntí póilíneachta.',
  'Documento de defesa das comunidades Traveller e Roma sobre policiamento excessivo, proteção contra o crime, confiança e participação nas decisões policiais.',
  'مذكرة مناصرة للترافيلر والروما عن الإفراط في التدخل الشرطي والحماية من الجريمة والثقة والمشاركة في القرارات الشرطية.',
  'Dokument rzeczniczy społeczności Travellers i Romów o nadmiernym nadzorze policyjnym, ochronie przed przestępczością, zaufaniu i udziale w decyzjach dotyczących policji.',
  'Document de advocacy pentru comunitățile Traveller și rome privind intervențiile polițienești excesive, protecția împotriva infracțiunilor, încrederea și participarea la deciziile poliției.',
  'Note de plaidoyer des communautés Travellers et roms sur le contrôle policier excessif, la protection contre la criminalité, la confiance et la participation aux décisions policières.',
  'Documento de defensa de las comunidades Traveller y romaní sobre control policial excesivo, protección frente al delito, confianza y participación en las decisiones policiales.',
  '旅行者和罗姆人权益倡导简报，讨论过度警务干预、犯罪保护、信任以及参与警务决策。'
 ]],
 ['University and advocacy research on Dublin Muslims’ experiences of hostility, Garda interactions, trust and barriers to reporting.', [
  'Taighde ollscoile agus abhcóideachta ar eispéiris Mhoslamaigh Bhaile Átha Cliath maidir le naimhdeas, teagmhálacha leis na Gardaí, muinín agus bacainní ar thuairisciú.',
  'Investigação universitária e de advocacy sobre experiências de hostilidade, interações com a Garda, confiança e barreiras à denúncia entre muçulmanos de Dublin.',
  'بحث جامعي وحقوقي عن تجارب المسلمين في دبلن مع العداء والتفاعل مع الشرطة والثقة وعوائق الإبلاغ.',
  'Badanie akademickie i rzecznicze o doświadczeniach muzułmanów w Dublinie dotyczących wrogości, kontaktów z Garda, zaufania i barier w zgłaszaniu incydentów.',
  'Cercetare universitară și de advocacy despre experiențele musulmanilor din Dublin privind ostilitatea, interacțiunile cu Garda, încrederea și barierele raportării.',
  'Recherche universitaire et associative sur les expériences des musulmans de Dublin concernant l’hostilité, les interactions avec la Garda, la confiance et les obstacles au signalement.',
  'Investigación universitaria y de advocacy sobre experiencias de hostilidad, interacciones con la Garda, confianza y barreras para denunciar entre musulmanes de Dublín.',
  '大学与权益倡导研究探讨都柏林穆斯林面对敌意、与警察互动、信任及报告事件障碍的经历。'
 ]],
 ['LGBTQ+ community submission on barriers to reporting, hate-crime responses and trans and non-binary people’s experiences of Garda contact.', [
  'Aighneacht ón bpobal LGBTQ+ ar bhacainní ar thuairisciú, freagairtí ar choireacht fuatha agus eispéiris daoine trasinscneacha agus neamh-dhénártha leis na Gardaí.',
  'Contributo da comunidade LGBTQ+ sobre barreiras à denúncia, respostas a crimes de ódio e experiências de pessoas trans e não binárias no contacto com a Garda.',
  'مساهمة من مجتمع LGBTQ+ عن عوائق الإبلاغ والاستجابة لجرائم الكراهية وتجارب العابرين وغير الثنائيين في التواصل مع الشرطة.',
  'Stanowisko społeczności LGBTQ+ o barierach w zgłaszaniu, reakcjach na przestępstwa z nienawiści oraz doświadczeniach osób trans i niebinarnych w kontaktach z Garda.',
  'Contribuție a comunității LGBTQ+ privind barierele raportării, răspunsurile la infracțiunile motivate de ură și experiențele persoanelor trans și non-binare în contactul cu Garda.',
  'Contribution de la communauté LGBTQ+ sur les obstacles au signalement, les réponses aux crimes de haine et les expériences des personnes trans et non binaires avec la Garda.',
  'Aportación de la comunidad LGBTQ+ sobre barreras para denunciar, respuestas a delitos de odio y experiencias de personas trans y no binarias en sus contactos con la Garda.',
  'LGBTQ+社区提交的意见，讨论报告事件的障碍、仇恨犯罪应对，以及跨性别和非二元人士与警察接触的经历。'
 ]],
 ['Advocacy research on sex workers’ experiences of Garda contact, trust and reporting violence in Ireland.', [
  'Taighde abhcóideachta ar eispéiris oibrithe gnéis maidir le teagmháil leis na Gardaí, muinín agus foréigean a thuairisciú in Éirinn.',
  'Investigação de advocacy sobre experiências de profissionais do sexo no contacto com a Garda, confiança e denúncia de violência na Irlanda.',
  'بحث حقوقي عن تجارب العاملين في الجنس مع الشرطة والثقة والإبلاغ عن العنف في أيرلندا.',
  'Badanie rzecznicze o doświadczeniach osób świadczących usługi seksualne dotyczących kontaktów z Garda, zaufania i zgłaszania przemocy w Irlandii.',
  'Cercetare de advocacy despre experiențele lucrătorilor sexuali privind contactul cu Garda, încrederea și raportarea violenței în Irlanda.',
  'Recherche associative sur les expériences des travailleurs et travailleuses du sexe concernant la Garda, la confiance et le signalement des violences en Irlande.',
  'Investigación de advocacy sobre experiencias de personas que ejercen el trabajo sexual en sus contactos con la Garda, confianza y denuncia de violencia en Irlanda.',
  '权益倡导研究探讨爱尔兰性工作者与警察接触、信任及报告暴力方面的经历。'
 ]],
 ['Official survey of reported discrimination in Garda contact, with breakdowns by ethnicity, religion, gender identity, sexual orientation and age.', [
  'Suirbhé oifigiúil ar idirdhealú a tuairiscíodh i dteagmhálacha leis na Gardaí, le miondealú de réir eitneachta, reiligiúin, féiniúlachta inscne, claonta ghnéasaigh agus aoise.',
  'Inquérito oficial sobre discriminação relatada no contacto com a Garda, com dados por etnia, religião, identidade de género, orientação sexual e idade.',
  'مسح رسمي للتمييز المُبلّغ عنه في التواصل مع الشرطة، مع تصنيفات حسب الإثنية والدين والهوية الجندرية والتوجه الجنسي والعمر.',
  'Oficjalne badanie zgłaszanej dyskryminacji w kontaktach z Garda, z podziałem według pochodzenia etnicznego, religii, tożsamości płciowej, orientacji seksualnej i wieku.',
  'Sondaj oficial privind discriminarea raportată în contactul cu Garda, cu date după etnie, religie, identitate de gen, orientare sexuală și vârstă.',
  'Enquête officielle sur la discrimination déclarée lors des contacts avec la Garda, avec une ventilation par origine ethnique, religion, identité de genre, orientation sexuelle et âge.',
  'Encuesta oficial sobre discriminación declarada en contactos con la Garda, con datos por etnia, religión, identidad de género, orientación sexual y edad.',
  '关于与警察接触时所报告歧视经历的官方调查，按族裔、宗教、性别认同、性取向和年龄分类。'
 ]],
 ['First-time user guide', ['Treoir don chéad úsáid','Guia para a primeira utilização','دليل المستخدم الجديد','Przewodnik dla nowych użytkowników','Ghid pentru prima utilizare','Guide pour une première utilisation','Guía para la primera visita','首次使用指南']],
 ['Open the first-time user guide PDF', ['Oscail an treoir PDF don chéad úsáid','Abrir o guia PDF para a primeira utilização','فتح دليل المستخدم الجديد بصيغة PDF','Otwórz przewodnik PDF dla nowych użytkowników','Deschide ghidul PDF pentru prima utilizare','Ouvrir le guide PDF pour une première utilisation','Abrir la guía PDF para la primera visita','打开首次使用指南PDF']],
 ['Preview of the first-time user guide', ['Réamhamharc ar an treoir don chéad úsáid','Pré-visualização do guia para a primeira utilização','معاينة دليل المستخدم الجديد','Podgląd przewodnika dla nowych użytkowników','Previzualizarea ghidului pentru prima utilizare','Aperçu du guide pour une première utilisation','Vista previa de la guía para la primera visita','首次使用指南预览']],
 ['Open the full PDF', ['Oscail an PDF iomlán','Abrir o PDF completo','فتح ملف PDF الكامل','Otwórz pełny PDF','Deschide PDF-ul complet','Ouvrir le PDF complet','Abrir el PDF completo','打开完整PDF']],
 ['Learn how to choose a role, explore a situation, compare perspectives and review your decisions.', [
  'Foghlaim conas ról a roghnú, cás a fhiosrú, dearcthaí a chur i gcomparáid agus do chinntí a athbhreithniú.',
  'Saiba como escolher um papel, explorar uma situação, comparar perspetivas e rever as suas decisões.',
  'تعرّف على اختيار دور واستكشاف موقف ومقارنة وجهات النظر ومراجعة قراراتك.',
  'Dowiedz się, jak wybrać rolę, przeanalizować sytuację, porównać perspektywy i przejrzeć swoje decyzje.',
  'Află cum să alegi un rol, să explorezi o situație, să compari perspectivele și să îți revizuiești deciziile.',
  'Découvrez comment choisir un rôle, explorer une situation, comparer les perspectives et revoir vos décisions.',
  'Aprende a elegir un papel, explorar una situación, comparar perspectivas y revisar tus decisiones.',
  '了解如何选择角色、探索情境、比较视角并回顾自己的决定。'
 ]],
 ['English PDF', ['PDF i mBéarla','PDF em inglês','ملف PDF باللغة الإنجليزية','PDF w języku angielskim','PDF în engleză','PDF en anglais','PDF en inglés','英文PDF']],
 ['3 pages', ['3 leathanach','3 páginas','3 صفحات','3 strony','3 pagini','3 pages','3 páginas','3页']]
];
const searchCopy = [
 ['Search', ['Cuardaigh','Pesquisar','بحث','Szukaj','Caută','Rechercher','Buscar','搜索']],
 ['Search the website', ['Cuardaigh an suíomh','Pesquisar no site','البحث في الموقع','Przeszukaj witrynę','Caută pe site','Rechercher sur le site','Buscar en el sitio','搜索网站']],
 ['Close search', ['Dún an cuardach','Fechar pesquisa','إغلاق البحث','Zamknij wyszukiwanie','Închide căutarea','Fermer la recherche','Cerrar búsqueda','关闭搜索']],
 ['Search situations, topics and sources.', ['Cuardaigh cásanna, topaicí agus foinsí.','Pesquise situações, temas e fontes.','ابحث في المواقف والمواضيع والمصادر.','Wyszukuj sytuacje, tematy i źródła.','Caută situații, teme și surse.','Recherchez des situations, des thèmes et des sources.','Busca situaciones, temas y fuentes.','搜索情境、主题和资料来源。']],
 ['Keywords', ['Eochairfhocail','Palavras-chave','الكلمات المفتاحية','Słowa kluczowe','Cuvinte-cheie','Mots-clés','Palabras clave','关键词']],
 ['Results', ['Torthaí','Resultados','النتائج','Wyniki','Rezultate','Résultats','Resultados','结果']],
 ['Situation', ['Cás','Situação','موقف','Sytuacja','Situație','Situation','Situación','情境']],
 ['Page', ['Leathanach','Página','صفحة','Strona','Pagină','Page','Página','页面']],
 ['Source', ['Foinse','Fonte','مصدر','Źródło','Sursă','Source','Fuente','资料来源']],
 ['No results. Try another keyword.', ['Gan torthaí. Bain triail as eochairfhocal eile.','Sem resultados. Experimente outra palavra-chave.','لا توجد نتائج. جرّب كلمة مفتاحية أخرى.','Brak wyników. Spróbuj innego słowa kluczowego.','Niciun rezultat. Încearcă alt cuvânt-cheie.','Aucun résultat. Essayez un autre mot-clé.','No hay resultados. Prueba otra palabra clave.','没有结果。请尝试其他关键词。']],
 ['Showing the first 20 results. Add another keyword to narrow your search.', [
  'Na chéad 20 toradh á dtaispeáint. Cuir eochairfhocal eile leis chun an cuardach a chúngú.',
  'A mostrar os primeiros 20 resultados. Adicione outra palavra-chave para restringir a pesquisa.',
  'يتم عرض أول 20 نتيجة. أضف كلمة مفتاحية أخرى لتضييق نطاق البحث.',
  'Wyświetlono pierwsze 20 wyników. Dodaj kolejne słowo kluczowe, aby zawęzić wyszukiwanie.',
  'Sunt afișate primele 20 de rezultate. Adaugă alt cuvânt-cheie pentru a restrânge căutarea.',
  'Les 20 premiers résultats sont affichés. Ajoutez un mot-clé pour affiner la recherche.',
  'Se muestran los primeros 20 resultados. Añade otra palabra clave para acotar la búsqueda.',
  '显示前20条结果。请添加关键词以缩小搜索范围。'
 ]]
];
const posterCopy = [
 ['Example responses', [
  'Samplaí d’fhreagraí', 'Exemplos de respostas', 'أمثلة على الردود', 'Przykładowe odpowiedzi',
  'Exemple de răspunsuri', 'Exemples de réponses', 'Ejemplos de respuestas', '回答示例'
 ]],
 ['Interactive learning prototype', [
  'Fréamhshamhail don fhoghlaim idirghníomhach',
  'Protótipo de aprendizagem interativa',
  'نموذج أولي للتعلّم التفاعلي',
  'Prototyp do nauki interaktywnej',
  'Prototip de învățare interactivă',
  'Prototype d’apprentissage interactif',
  'Prototipo de aprendizaje interactivo',
  '互动学习原型'
 ]],
 ['One situation. Two perspectives.', [
  'Cás amháin. Dhá dhearcadh.', 'Uma situação. Duas perspetivas.', 'موقف واحد. منظوران.', 'Jedna sytuacja. Dwie perspektywy.',
  'O situație. Două perspective.', 'Une situation. Deux perspectives.', 'Una situación. Dos perspectivas.', '同一个情境。两种视角。'
 ]],
 ['Interactive learning about rights, choices and perspectives.', [
  'Foghlaim idirghníomhach faoi chearta, roghanna agus dearcthaí.',
  'Aprendizagem interativa sobre direitos, escolhas e perspetivas.',
  'تعلّم تفاعلي حول الحقوق والخيارات ووجهات النظر.',
  'Interaktywna nauka o prawach, wyborach i różnych perspektywach.',
  'Învățare interactivă despre drepturi, alegeri și perspective.',
  'Un apprentissage interactif sur les droits, les choix et les points de vue.',
  'Aprendizaje interactivo sobre derechos, decisiones y puntos de vista.',
  '通过互动学习了解权利、选择和不同的视角。'
 ]],
 ['Step into a real-world-style scenario, make decisions, and see how the same situation can look different from more than one perspective.', [
  'Glac páirt i gcás atá cosúil leis an bhfíorshaol, déan cinntí agus féach ar an gcuma a d’fhéadfadh a bheith ar an gcás céanna ó dhearcthaí éagsúla.',
  'Entre num cenário inspirado na vida real, tome decisões e descubra como a mesma situação pode parecer diferente consoante o ponto de vista.',
  'شارك في سيناريو يحاكي الحياة الواقعية، واتخذ قرارات، واكتشف كيف يبدو الموقف نفسه من وجهات نظر مختلفة.',
  'Weź udział w realistycznym scenariuszu, podejmuj decyzje i zobacz, jak różnie można spojrzeć na tę samą sytuację.',
  'Intră într-un scenariu inspirat din viața reală, ia decizii și descoperă cum poate fi văzută aceeași situație din perspective diferite.',
  'Plongez dans un scénario inspiré de la vie réelle, prenez des décisions et découvrez comment une même situation peut être perçue de différents points de vue.',
  'Participa en un escenario inspirado en la vida real, toma decisiones y descubre cómo cambia la percepción de una misma situación según el punto de vista.',
  '走进贴近现实的情境，作出决定，看看从不同角度理解同一件事会有什么不同。'
 ]],
 ['Read the situation', [
  'Léigh an cás', 'Leia a situação', 'اقرأ تفاصيل الموقف', 'Przeczytaj opis sytuacji',
  'Citește descrierea situației', 'Lisez la situation', 'Lee la situación', '阅读情境'
 ]],
 ['See the same situation from both sides.', [
  'Féach ar an gcás céanna ón dá thaobh.', 'Veja a mesma situação de ambos os lados.', 'انظر إلى الموقف نفسه من منظور الطرفين.', 'Spójrz na tę samą sytuację z obu stron.',
  'Privește aceeași situație din ambele perspective.', 'Découvrez la même situation des deux points de vue.', 'Observa la misma situación desde ambos puntos de vista.', '从双方的角度看同一个情境。'
 ]],
 ['Alex and Garda Aisling outside the GPO on O’Connell Street, Dublin.', [
  'Alex agus an Garda Aisling taobh amuigh d’Ard-Oifig an Phoist ar Shráid Uí Chonaill, Baile Átha Cliath.',
  'Alex e a agente da Garda Aisling em frente à estação central dos correios na O’Connell Street, em Dublin.',
  'Alex والشرطية الأيرلندية Aisling أمام مبنى البريد العام في شارع أوكونيل في دبلن.',
  'Alex i funkcjonariuszka Garda Aisling przed gmachem Poczty Głównej przy O’Connell Street w Dublinie.',
  'Alex și polițista Aisling de la Garda în fața Poștei Centrale de pe O’Connell Street, în Dublin.',
  'Alex et Aisling, agente de la Garda, devant la poste centrale de Dublin, sur O’Connell Street.',
  'Alex y Aisling, agente de la Garda, frente a la Oficina Central de Correos en O’Connell Street, Dublín.',
  'Alex 和爱尔兰警员 Aisling 在都柏林奥康奈尔街的邮政总局门前。'
 ]],
 ['Four steps of the learning experience', [
  'Ceithre chéim den fhoghlaim', 'Quatro etapas de aprendizagem', 'أربع خطوات للتعلّم', 'Cztery etapy nauki',
  'Patru etape de învățare', 'Les quatre étapes de l’apprentissage', 'Cuatro pasos del aprendizaje', '四个学习步骤'
 ]],
 ['Example choices shown for illustration only', [
  'Roghanna mar shampla amháin', 'Opções apresentadas apenas como exemplo', 'خيارات معروضة على سبيل المثال فقط', 'Przykładowe odpowiedzi pokazane wyłącznie dla ilustracji',
  'Opțiuni prezentate doar ca exemplu', 'Choix présentés à titre d’exemple uniquement', 'Opciones que se muestran solo como ejemplo', '以下选项仅为示例'
 ]],
 ['Start learning with a role', [
  'Tosaigh ag foghlaim i ról', 'Comece a aprender num dos papéis', 'ابدأ التعلّم باختيار دور', 'Rozpocznij naukę w wybranej roli',
  'Începe să înveți alegând un rol', 'Commencez l’apprentissage dans un rôle', 'Empieza a aprender eligiendo un papel', '选择角色，开始学习'
 ]]
];
const translations = new Map([...labels,...content,...terminology,...communityResearch,...contributionCopy,...additionalContributorLabels,...communityResourceCopy,...searchCopy,...posterCopy]);
export function learningCopy(text,language){
 return translations.get(text)?.[languages.indexOf(language)];
}

