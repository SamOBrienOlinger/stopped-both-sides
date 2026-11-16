// Columns follow this order so each piece of UI copy can be reviewed together.
const languages = ['ga','pt','ar','pl','ro','fr','es','zh-Hans'];

const labels = [
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
 ['Play and discuss this situation', [
  'Imir agus pléigh an cás seo','Jogue e discuta esta situação','العب وناقش هذا الموقف','Rozegraj i omów tę sytuację',
  'Joacă și discută această situație','Jouer et discuter de cette situation','Juega y comenta esta situación','体验并讨论这个情境'
 ]],
 ['Allow about 15 minutes.', [
  'Cuir thart ar 15 nóiméad ar leataobh.','Reserve cerca de 15 minutos.','خصّص نحو 15 دقيقة.','Zarezerwuj około 15 minut.',
  'Rezervă aproximativ 15 minute.','Prévoyez environ 15 minutes.','Reserva unos 15 minutos.','预留约 15 分钟。'
 ]],
 ['Choose a player. Other people can follow along as observers.', [
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
 ['You shared the search summary with the community reviewer. It gives finds and totals for each group.', [
  'Roinn tú achoimre na gcuardach leis an athbhreithneoir pobail. Tugtar na torthaí agus na hiomláin do gach grúpa inti.','Partilhou o resumo das buscas com o representante da comunidade. Mostra os achados e os totais por grupo.','شاركت ملخص التفتيش مع ممثل المجتمع. يوضح عدد عمليات التفتيش وما أسفر عن العثور على شيء في كل مجموعة.','Przedstawiasz przedstawicielowi społeczności zestawienie. Podaje łączną liczbę przeszukań i liczbę przeszukań z wynikiem dla każdej grupy.',
  'Ai împărtășit rezumatul cu reprezentantul comunității. Arată totalurile și rezultatele pentru fiecare grup.','Vous avez montré le récapitulatif au représentant de la communauté. Il donne les totaux et le nombre de fouilles avec résultat par groupe.','Has compartido el resumen con el representante de la comunidad. Muestra los hallazgos y los totales de cada grupo.','你向社区代表展示了搜查汇总，其中列出每组的搜查总数和查获次数。'
 ]],
 ['A community reviewer meets the supervising Garda sergeant after residents say they felt singled out during searches.', [
  'Buaileann ionadaí pobail leis an sáirsint maoirseachta tar éis do chónaitheoirí a rá gur bhraith siad gur díríodh orthu le linn cuardaigh.','Um representante da comunidade reúne-se com o sargento responsável depois de moradores dizerem que se sentiram alvo de buscas.','يلتقي ممثل المجتمع برقيب الغاردا المشرف بعد أن قال سكان إنهم شعروا بأنهم استُهدفوا بالتفتيش.','Przedstawiciel społeczności spotyka się z nadzorującym sierżantem Garda po tym, jak mieszkańcy zgłosili poczucie, że wybierano ich do przeszukań.',
  'Un reprezentant al comunității se întâlnește cu sergentul Garda responsabil după ce locuitorii spun că s-au simțit vizați la percheziții.','Un représentant de la communauté rencontre le sergent responsable après que des habitants ont dit s’être sentis ciblés lors de fouilles.','Un representante de la comunidad se reúne con el sargento responsable tras contar los vecinos que se sintieron señalados en los registros.','居民反映在搜查中觉得自己被特别针对。一位社区代表与负责监督的警佐会面。'
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
 ['What should the sergeant and community reviewer look into together?', [
  'Cad ba chóir don sáirsint agus don ionadaí pobail a fhiosrú le chéile?','O que devem analisar em conjunto o sargento e o representante da comunidade?','ما الذي ينبغي للرقيب وممثل المجتمع أن يتحريا معًا؟','Czym wspólnie powinni się zająć sierżant i przedstawiciel społeczności?',
  'Ce ar trebui să cerceteze împreună sergentul și reprezentantul comunității?','Sur quoi le sergent et le représentant de la communauté devraient-ils enquêter ensemble ?','¿Qué deberían examinar juntos el sargento y el representante de la comunidad?','警佐和社区代表应该一起调查什么？'
 ]]
];

const translations = new Map([...labels,...content]);
export function learningCopy(text,language){
 return translations.get(text)?.[languages.indexOf(language)];
}
