import { useState, useEffect, useRef } from "react";
import { auth, db, provider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// ── Book introductions ─────────────────────────────────────────────────────────
const BOOK_INTROS = {
  "Gênesis": "Gênesis é o primeiro livro da Bíblia e conta a origem de tudo: do mundo, da humanidade e do povo de Deus. Começa com a criação do universo e histórias como Adão e Eva, Noé e o dilúvio. Depois foca na família de Abraão — pai da fé — cujas promessas continuam com Isaque, Jacó e José.",
  "Êxodo": "Êxodo conta a história da libertação do povo de Israel da escravidão no Egito. Deus chama Moisés para liderar o povo e envia as famosas dez pragas. Após a saída miraculosa, Israel caminha pelo deserto e recebe os Dez Mandamentos no Sinai.",
  "Levítico": "Levítico é o manual de santidade de Israel. Contém leis sobre sacrifícios, pureza, sacerdócio e festas religiosas. O tema central é a santidade: Deus é santo e chama o seu povo a ser santo também.",
  "Números": "Números narra a jornada de Israel pelo deserto entre o Sinai e a terra prometida. Registra momentos de fé e muitas reclamações, rebeliões e julgamentos. Mesmo com fracassos, a fidelidade de Deus nunca falha.",
  "Deuteronômio": "Deuteronômio são os discursos de despedida de Moisés ao povo de Israel. Moisés relembra e aprofunda as leis dadas no Sinai. O livro chama o povo à obediência e ao amor a Deus. Termina com a morte de Moisés.",
  "Josué": "Josué narra a conquista e divisão da terra de Canaã. Josué lidera o povo com fé — a travessia do Jordão e a queda de Jericó são momentos marcantes. Termina com o desafio: 'Eu e minha casa, serviremos ao Senhor.'",
  "Juízes": "Juízes relata um ciclo repetido: o povo se afasta de Deus, cai em opressão, clama por ajuda e Deus levanta um juiz libertador. Figuras como Débora, Gideão e Sansão aparecem neste livro.",
  "Rute": "Rute é uma história de fidelidade, amor e redenção. A moabita Rute escolhe permanecer com sua sogra Noemi. Sua lealdade é recompensada quando ela encontra Boaz, um parente redentor. Rute é antepassada do rei Davi.",
  "1 Samuel": "1 Samuel marca a transição de Israel para uma monarquia. Samuel unge os dois primeiros reis: Saul e Davi. O contraste entre Saul — que desobedece — e Davi — um homem segundo o coração de Deus — é o coração do livro.",
  "2 Samuel": "2 Samuel acompanha o reinado de Davi como rei unificado de Israel. É uma história de glórias e fracassos: Davi conquista Jerusalém e recebe promessas eternas, mas também comete pecados graves.",
  "1 Reis": "1 Reis começa com o reinado de Salomão em todo o seu esplendor: a construção do Templo e a sabedoria famosa. Após sua morte, o reino se divide. O livro termina com a figura do profeta Elias.",
  "2 Reis": "2 Reis continua a história do reino dividido. O livro culmina com a queda do reino do norte pelos assírios e a queda de Jerusalém pelos babilônios, com o povo levado ao exílio.",
  "1 Crônicas": "1 Crônicas retoma a história de Israel com foco teológico, começando com genealogias de Adão até Davi. O livro enfatiza o reinado de Davi e sua preparação para a construção do Templo.",
  "2 Crônicas": "2 Crônicas narra o reinado de Salomão e a construção do Templo, depois acompanha os reis de Judá. Destaca os momentos de reforma espiritual. O livro termina com o decreto de Ciro permitindo o retorno do povo.",
  "Esdras": "Esdras narra o retorno dos judeus do exílio na Babilônia para Jerusalém. A primeira onda foca na reconstrução do Templo. A segunda é liderada pelo próprio Esdras, escriba e sacerdote.",
  "Neemias": "Neemias é a história de um homem de oração e ação. Copeiro do rei persa, Neemias obtém permissão para reconstruir os muros de Jerusalém e lidera a obra apesar de forte oposição.",
  "Ester": "Ester é uma história de coragem e providência divina. Uma jovem judia se torna rainha da Pérsia e arrisca a vida para salvar seu povo de um decreto de extermínio. 'Para um momento como este' resume a mensagem central.",
  "Jó": "Jó trata do sofrimento humano e da soberania de Deus. Jó, um homem justo, perde tudo. O próprio Deus responde a Jó do meio do redemoinho. Jó não recebe todas as respostas, mas encontra Deus — e isso é suficiente.",
  "Salmos": "Salmos é o livro de canções e orações de Israel — e da humanidade. São 150 poemas que expressam toda a gama de emoções humanas diante de Deus: alegria, lamento, gratidão, desespero, confiança e adoração.",
  "Provérbios": "Provérbios é um manual de sabedoria para a vida prática. Escrito principalmente por Salomão, ensina como viver com integridade, sabedoria e temor a Deus no dia a dia. A sabedoria começa com o 'temor ao Senhor'.",
  "Eclesiastes": "Eclesiastes é a reflexão de um rei sábio sobre o sentido da vida. 'Vaidade das vaidades' é o mote — sem Deus, tudo é fugaz. A conclusão: teme a Deus e guarda seus mandamentos.",
  "Cantares": "Cantares é um poema lírico sobre o amor entre um homem e uma mulher. Seu lugar na Bíblia fala da beleza e santidade do amor humano. Ao longo da história, também foi lido como metáfora do amor de Deus pelo seu povo.",
  "Isaías": "Isaías é o maior dos profetas escritores, chamado de 'o Evangelho do Antigo Testamento'. Os capítulos 40-66 trazem consolação profunda e as famosas profecias do Servo Sofredor, que apontam para Jesus.",
  "Jeremias": "Jeremias foi chamado de 'profeta das lágrimas'. Sua missão foi anunciar o juízo de Deus sobre Judá. Ele sofreu perseguições e rejeição, mas também profetizou uma nova aliança gravada no coração.",
  "Lamentações": "Lamentações são cinco poemas de luto pela destruição de Jerusalém. No coração do livro há uma declaração de esperança: 'As misericórdias do Senhor não têm fim; renovam-se a cada manhã.'",
  "Ezequiel": "Ezequiel foi um profeta que ministrou entre os exilados na Babilônia. Seu livro é cheio de visões extraordinárias — a glória de Deus, o vale dos ossos secos, o templo celestial.",
  "Daniel": "Daniel foi levado jovem para a Babilônia e manteve-se fiel a Deus. Seu livro tem duas partes: histórias de fidelidade (a fornalha, a cova dos leões) e visões apocalípticas sobre impérios e o reino de Deus.",
  "Oséias": "Oséias foi chamado a casar com uma mulher infiel como símbolo do relacionamento de Deus com Israel. O amor persistente de Oséias por sua esposa ilustra o amor inabalável de Deus pelo seu povo.",
  "Joel": "Joel profetizou após uma invasão devastadora de gafanhotos. Ele interpreta o desastre como chamado ao arrependimento e anuncia que Deus derramará seu Espírito sobre toda a carne.",
  "Amós": "Amós era um pastor quando Deus o chamou para profetizar. Seu recado foi contundente: Deus não aceita adoração religiosa acompanhada de injustiça social. 'Que a justiça flua como água.'",
  "Obadias": "Obadias é o menor livro do Antigo Testamento — apenas 21 versículos. É uma profecia de julgamento contra Edom, nação vizinha que se alegrou com a queda de Jerusalém.",
  "Jonas": "Jonas é a história do único profeta enviado a uma nação estrangeira. Chamado a pregar em Nínive, Jonas foge. Engolido por um grande peixe, ele finalmente obedece. O livro questiona: você quer a graça de Deus só para você?",
  "Miquéias": "Miquéias condena a corrupção e injustiça, mas anuncia esperança messiânica. O resumo mais famoso da fé está em Miquéias 6.8: 'Agir com justiça, amar a misericórdia e andar humildemente com Deus.'",
  "Naum": "Naum profetizou a queda de Nínive, capital da Assíria. O livro afirma que Deus é lento para irar-se, mas não deixa impune os que persistem no mal.",
  "Habacuque": "Habacuque ousa questionar Deus diretamente. O livro é um diálogo honesto entre o profeta e Deus. A resposta divina convida à confiança: 'O justo viverá pela sua fé.'",
  "Sofonias": "Sofonias anuncia o 'Dia do Senhor' sobre Judá e as nações. Mas o livro termina com beleza: em Sofonias 3.17, Deus declara que se alegra sobre o seu povo com cantos.",
  "Ageu": "Ageu profetizou logo após o retorno do exílio, quando o povo havia deixado o Templo em ruínas. Com dois sermões práticos, convoca o povo a retomar a obra e lembra que Deus está com eles.",
  "Zacarias": "Zacarias profetizou para encorajar o povo no retorno do exílio. Seu livro é cheio de visões simbólicas e profecias messiânicas impressionantes — o rei em um jumento, o pastor traído por 30 moedas de prata.",
  "Malaquias": "Malaquias é o último livro do Antigo Testamento. O povo estava em apatia espiritual. Malaquias termina anunciando a vinda de um mensageiro — cumprida em João Batista.",
  "Mateus": "Mateus apresenta Jesus como o Messias prometido. O livro está estruturado em cinco grandes discursos, sendo o primeiro o Sermão do Monte. Termina com a Grande Comissão: ir e fazer discípulos de todas as nações.",
  "Marcos": "Marcos é o Evangelho mais curto e dinâmico. Apresenta Jesus como um servo poderoso em ação: curando, ensinando e exercendo autoridade. O ponto central: 'Quem é este homem?' — a resposta está na cruz.",
  "Lucas": "Lucas escreveu o Evangelho mais completo sobre a humanidade de Jesus. Ele dá voz a quem a sociedade ignorava: mulheres, pobres, samaritanos, pecadores. O Filho Pródigo e o Bom Samaritano aparecem aqui.",
  "João": "João é mais reflexivo e teológico. Começa com 'No princípio era o Verbo.' Sete sinais milagrosos e sete 'Eu sou' de Jesus marcam o livro. O propósito: que o leitor creia que Jesus é o Cristo e tenha vida em seu nome.",
  "Atos": "Atos é a história do nascimento e expansão da Igreja. Começa com o Pentecostes em Jerusalém. De lá, a mensagem de Jesus se espalha pelo mundo — especialmente através do ministério do apóstolo Paulo.",
  "Romanos": "Romanos é a mais sistemática das cartas de Paulo — uma exposição completa do evangelho. Paulo apresenta o problema do pecado, a solução na justificação pela fé e a vida nova pelo Espírito.",
  "1 Coríntios": "1 Coríntios foi escrita para uma igreja dividida e cheia de problemas. Paulo responde com sabedoria e firmeza, entregando joias como o capítulo 13 sobre o amor e o capítulo 15 sobre a ressurreição.",
  "2 Coríntios": "2 Coríntios é a carta mais pessoal de Paulo. Ele abre seu coração sobre sofrimentos, fraquezas e graça. 'A minha graça é suficiente para ti' é dita em meio a suas fraquezas.",
  "Gálatas": "Gálatas é o 'manifesto da liberdade cristã'. Paulo escreve com urgência: somos justificados pela fé, não pelas obras. A vida cristã é fruto do Espírito, não do esforço próprio.",
  "Efésios": "Efésios revela o mistério do propósito eterno de Deus: reunir todas as coisas em Cristo. A primeira metade fala das riquezas espirituais em Cristo; a segunda, de como viver à altura dessa vocação.",
  "Filipenses": "Filipenses é a carta da alegria — escrita de dentro de uma prisão. 'Alegrai-vos sempre no Senhor' e 'Posso tudo naquele que me fortalece' são ditos nessa carta.",
  "Colossenses": "Colossenses responde a heresias que diminuíam Cristo. Paulo afirma: em Cristo habita corporalmente toda a plenitude da divindade. Cristo é suficiente.",
  "1 Tessalonicenses": "1 Tessalonicenses é uma das primeiras cartas de Paulo. Escrita para uma jovem Igreja que enfrentava perseguição, traz encorajamento e esperança na volta de Cristo.",
  "2 Tessalonicenses": "2 Tessalonicenses esclarece confusões sobre a volta de Cristo. Paulo exorta ao trabalho diligente enquanto se espera.",
  "1 Timóteo": "1 Timóteo é uma carta pastoral de Paulo ao seu jovem discípulo Timóteo. Paulo orienta sobre adoração, escolha de líderes e o perigo do amor ao dinheiro.",
  "2 Timóteo": "2 Timóteo é provavelmente a última carta de Paulo. 'Combati o bom combate, terminei a corrida, guardei a fé' — palavras finais de um apóstolo fiel.",
  "Tito": "Tito orienta sobre escolha de líderes e vida cristã no contexto social. A mensagem central é que a graça de Deus nos ensina a renunciar à impiedade — a fé genuína transforma o comportamento.",
  "Filemon": "Filemon é a menor carta de Paulo — apenas um capítulo. É um apelo para que Filemon receba de volta Onésimo, seu escravo fugido que se converteu. Uma carta sobre perdão e reconciliação.",
  "Hebreus": "Hebreus foi escrita para cristãos de origem judaica. O argumento central: Jesus é superior a tudo. Ele é o sumo sacerdote perfeito. O famoso 'hall da fé' do capítulo 11 celebra os heróis da fé.",
  "Tiago": "Tiago é uma carta prática sobre fé que se prova em ações. 'A fé sem obras é morta.' O livro trata do uso da língua, favoritismo, riqueza e oração. A fé genuína produz frutos visíveis.",
  "1 Pedro": "1 Pedro foi escrita para cristãos enfrentando sofrimento e perseguição. Pedro os chama de 'estrangeiros e peregrinos'. O livro ensina como viver com esperança e santidade em meio à adversidade.",
  "2 Pedro": "2 Pedro alerta contra falsos mestres. Pedro chama os crentes a crescer em conhecimento e virtude, e lembra que a promessa da volta de Cristo é certa.",
  "1 João": "1 João combate heresias e apresenta três testes da vida cristã genuína: crer na verdade sobre Jesus, obedecer aos mandamentos e amar os irmãos. 'Deus é amor' aparece aqui com profundidade.",
  "2 João": "2 João é uma carta brevíssima que exorta ao amor mútuo e alerta contra receber aqueles que negam a doutrina de Cristo. A verdade e o amor andam juntos.",
  "3 João": "3 João elogia Gaio por sua hospitalidade e contrasta com Diótrefes, um líder orgulhoso. É uma janela para os desafios da liderança nas igrejas do primeiro século.",
  "Judas": "Judas é uma carta urgente de alerta contra falsos mestres que distorciam a graça de Deus. Termina com uma das mais belas doxologias da Bíblia.",
  "Apocalipse": "Apocalipse é a grande revelação dada ao apóstolo João. Escrito em linguagem simbólica para cristãos sob perseguição, revela que Cristo é o Senhor da história. O ponto central: o Cordeiro venceu. A história termina com Deus habitando com a humanidade para sempre.",
};

function getBook(r) { return r.replace(/\s+\d[\d,-]*$/, "").trim(); }

const READINGS = [
  "Gênesis 1-3","Gênesis 4-6","Gênesis 7-9","Gênesis 10-12","Gênesis 13-16","Gênesis 17-19","Gênesis 20-22","Gênesis 23-24","Gênesis 25-27","Gênesis 28-30","Gênesis 31-32","Gênesis 33-35","Gênesis 36-37","Gênesis 38-40","Gênesis 41-42","Gênesis 43-45","Gênesis 46-47","Gênesis 48-50",
  "Êxodo 1-4","Êxodo 5-7","Êxodo 8-10","Êxodo 11-13","Êxodo 14-16","Êxodo 17-20","Êxodo 21-23","Êxodo 24-26","Êxodo 27-29","Êxodo 30-32","Êxodo 33-35","Êxodo 36-38","Êxodo 39-40",
  "Levítico 1-4","Levítico 5-7","Levítico 8-10","Levítico 11-13","Levítico 14-15","Levítico 16-18","Levítico 19-21","Levítico 22-23","Levítico 24-25","Levítico 26-27",
  "Números 1-2","Números 3-4","Números 5-7","Números 8-10","Números 11-13","Números 14-15","Números 16-18","Números 19-21","Números 22-24","Números 25-26","Números 27-29","Números 30-32","Números 33-34","Números 35-36",
  "Deuteronômio 1-2","Deuteronômio 3-4","Deuteronômio 5-7","Deuteronômio 8-11","Deuteronômio 12-14","Deuteronômio 15-18","Deuteronômio 19-22","Deuteronômio 23-26","Deuteronômio 27-28","Deuteronômio 29-31","Deuteronômio 32-34",
  "Josué 1-4","Josué 5-8","Josué 9-11","Josué 12-14","Josué 15-16","Josué 17-19","Josué 20-22","Josué 23-24",
  "Juízes 1-3","Juízes 4-6","Juízes 7-9","Juízes 10-12","Juízes 13-16","Juízes 17-19","Juízes 20-21",
  "Rute 1-4",
  "1 Samuel 1-3","1 Samuel 4-7","1 Samuel 8-10","1 Samuel 11-14","1 Samuel 15-17","1 Samuel 18-20","1 Samuel 21-24","1 Samuel 25-27","1 Samuel 28-31",
  "2 Samuel 1-3","2 Samuel 4-7","2 Samuel 8-11","2 Samuel 12-14","2 Samuel 15-17","2 Samuel 18-19","2 Samuel 20-22","2 Samuel 23-24",
  "1 Reis 1-2","1 Reis 3-5","1 Reis 6-7","1 Reis 8-9","1 Reis 10-11","1 Reis 12-14","1 Reis 15-17","1 Reis 18-20","1 Reis 21-22",
  "2 Reis 1-4","2 Reis 5-7","2 Reis 8-10","2 Reis 11-14","2 Reis 15-17","2 Reis 18-19","2 Reis 20-23","2 Reis 24-25",
  "1 Crônicas 1-2","1 Crônicas 3-5","1 Crônicas 6","1 Crônicas 7-8","1 Crônicas 9-11","1 Crônicas 12-15","1 Crônicas 16-18","1 Crônicas 19-22","1 Crônicas 23-25","1 Crônicas 26-29",
  "2 Crônicas 1-4","2 Crônicas 5-7","2 Crônicas 8-11","2 Crônicas 12-15","2 Crônicas 16-19","2 Crônicas 20-23","2 Crônicas 24-26","2 Crônicas 27-29","2 Crônicas 30-32","2 Crônicas 33-36",
  "Esdras 1-2","Esdras 3-6","Esdras 7-10",
  "Neemias 1-4","Neemias 5-7","Neemias 8-10","Neemias 11-13",
  "Ester 1-4","Ester 5-10",
  "Jó 1-2","Jó 3-5","Jó 6-8","Jó 9-11","Jó 12-15","Jó 16-20","Jó 21-25","Jó 26-28","Jó 29-31","Jó 32-34","Jó 35-37","Jó 38-40","Jó 41-42",
  "Salmos 1-7","Salmos 8-14","Salmos 15-18","Salmos 19-23","Salmos 24-29","Salmos 30-34","Salmos 35-37","Salmos 38-42","Salmos 43-47","Salmos 48-53","Salmos 54-59","Salmos 60-66","Salmos 67-69","Salmos 70-73","Salmos 74-78","Salmos 79-83","Salmos 84-89","Salmos 90-94","Salmos 95-102","Salmos 103-105","Salmos 106-107","Salmos 108-113","Salmos 113-118","Salmos 119","Salmos 120-130","Salmos 131-136","Salmos 137-143","Salmos 144-148","Salmos 149-150",
  "Provérbios 1-3","Provérbios 4-6","Provérbios 7-9","Provérbios 10-12","Provérbios 13-15","Provérbios 16-18","Provérbios 19-21","Provérbios 22-24","Provérbios 25-27","Provérbios 28-31",
  "Eclesiastes 1-4","Eclesiastes 5-8","Eclesiastes 9-12",
  "Cantares 1-5","Cantares 6-8",
  "Isaías 1-3","Isaías 4-7","Isaías 8-10","Isaías 11-14","Isaías 15-20","Isaías 21-24","Isaías 25-28","Isaías 29-32","Isaías 33-36","Isaías 37-40","Isaías 41-43","Isaías 44-47","Isaías 48-51","Isaías 52-57","Isaías 58-62","Isaías 63-66",
  "Jeremias 1-3","Jeremias 4-6","Jeremias 7-9","Jeremias 10-13","Jeremias 14-17","Jeremias 18-22","Jeremias 23-25","Jeremias 26-29","Jeremias 30-32","Jeremias 33-36","Jeremias 37-40","Jeremias 41-44","Jeremias 45-48","Jeremias 49-50","Jeremias 51-52",
  "Lamentações 1-3","Lamentações 4-5",
  "Ezequiel 1-4","Ezequiel 5-8","Ezequiel 9-12","Ezequiel 13-16","Ezequiel 17-20","Ezequiel 21-23","Ezequiel 24-27","Ezequiel 28-30","Ezequiel 31-33","Ezequiel 34-36","Ezequiel 37-39","Ezequiel 40-42","Ezequiel 43-45","Ezequiel 46-48",
  "Daniel 1-3","Daniel 4-6","Daniel 7-9","Daniel 10-12",
  "Oséias 1-5","Oséias 6-10","Oséias 11-14",
  "Joel 1-3","Amós 1-5","Amós 6-9","Obadias 1","Jonas 1-4","Miquéias 1-7","Naum 1-3","Habacuque 1-3","Sofonias 1-3","Ageu 1-2",
  "Zacarias 1-6","Zacarias 7-11","Zacarias 12-14","Malaquias 1-4",
  "Mateus 1-4","Mateus 5-6","Mateus 7-9","Mateus 10-11","Mateus 12-13","Mateus 14-15","Mateus 16-18","Mateus 19-21","Mateus 22-23","Mateus 24-25","Mateus 26","Mateus 27-28",
  "Marcos 1-2","Marcos 3-4","Marcos 5-6","Marcos 7-8","Marcos 9-10","Marcos 11-12","Marcos 13-14","Marcos 15-16",
  "Lucas 1","Lucas 2-3","Lucas 4-5","Lucas 6-7","Lucas 8-9","Lucas 10-11","Lucas 12-13","Lucas 14-16","Lucas 17-18","Lucas 19-20","Lucas 21-22","Lucas 23-24",
  "João 1-2","João 3-4","João 5-6","João 7-8","João 9-10","João 11-12","João 13-15","João 16-18","João 19-21",
  "Atos 1-2","Atos 3-5","Atos 6-7","Atos 8-9","Atos 10-11","Atos 12-13","Atos 14-16","Atos 17-19","Atos 20-21","Atos 22-24","Atos 25-28",
  "Romanos 1-3","Romanos 4-7","Romanos 8-9","Romanos 10-12","Romanos 13-16",
  "1 Coríntios 1-4","1 Coríntios 5-7","1 Coríntios 8-10","1 Coríntios 11-13","1 Coríntios 14-16",
  "2 Coríntios 1-4","2 Coríntios 5-8","2 Coríntios 9-13",
  "Gálatas 1-3","Gálatas 4-6","Efésios 1-4","Efésios 5-6","Filipenses 1-4","Colossenses 1-4",
  "1 Tessalonicenses 1-5","2 Tessalonicenses 1-3","1 Timóteo 1-6","2 Timóteo 1-4","Tito 1-3","Filemon 1",
  "Hebreus 1-5","Hebreus 6-9","Hebreus 10-11","Hebreus 12-13",
  "Tiago 1-5","1 Pedro 1-3","1 Pedro 4-5","2 Pedro 1-3","1 João 1-5","2 João 1","3 João 1","Judas 1",
  "Apocalipse 1-4","Apocalipse 5-8","Apocalipse 9-12","Apocalipse 13-16","Apocalipse 17-19","Apocalipse 20-22"
];

const START = new Date(2026, 3, 16);
const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MONTHS_SH = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

const DAYS = READINGS.map((reading, i) => {
  const date = addDays(START, i);
  const m = date.getMonth(), y = date.getFullYear();
  return { index: i, dayNum: i + 1, date, reading, book: getBook(reading),
    monthKey: `${y}-${m}`, monthLabel: `${MONTHS_PT[m]} ${y}`,
    monthShort: `${MONTHS_SH[m]}/${String(y).slice(2)}`,
    dateLabel: `${String(date.getDate()).padStart(2,"0")}/${String(m+1).padStart(2,"0")}` };
});

const MONTHS = [];
const mMap = {};
DAYS.forEach(day => {
  if (!mMap[day.monthKey]) { mMap[day.monthKey] = { key: day.monthKey, label: day.monthLabel, short: day.monthShort, days: [] }; MONTHS.push(mMap[day.monthKey]); }
  mMap[day.monthKey].days.push(day);
});

// ── Tokens ────────────────────────────────────────────────────────────────────
const STORAGE_KEY = "deus-todos-os-dias-v1";
const HEADER_BG = "#F4D8B4", BODY_BG = "#F9FAFB", CARD_DONE = "#F4EEE7";
const TITLE_CLR = "#492F1A", TAB_INACT = "#BF9463", TAB_LINE = "#FA6C24";
const ORANGE = "#FA6C24", BROWN = "#3D2B1F", GOLD = "#BF9463";
const CAL = "🗓️";
const calSans = "'Cal Sans','Inter',sans-serif", inter = "'Inter',sans-serif";

// Text colours for the editor palette
const TEXT_COLORS = [
  { label:"Preto",      hex:"#000000" }, { label:"Azul escuro", hex:"#1A3D8F" }, { label:"Teal",       hex:"#0F7173" },
  { label:"Verde",      hex:"#1A6B2E" }, { label:"Laranja",     hex:"#E8501A" }, { label:"Vermelho",   hex:"#B91C1C" },
  { label:"Roxo",       hex:"#6B21A8" }, { label:"Cinza",       hex:"#6B7280" }, { label:"Azul",       hex:"#2563EB" },
  { label:"Teal claro", hex:"#0891B2" }, { label:"Verde claro", hex:"#16A34A" }, { label:"Amarelo",    hex:"#CA8A04" },
  { label:"Vermelho leve","hex":"#DC2626" }, { label:"Lilás",  hex:"#9333EA" },
  { label:"Branco",     hex:"#FFFFFF" }, { label:"Azul pálido","hex":"#DBEAFE" }, { label:"Ciano pálido","hex":"#CFFAFE" },
  { label:"Verde pálido","hex":"#DCFCE7" }, { label:"Amarelo pálido","hex":"#FEF9C3" }, { label:"Salmão",   hex:"#FEE2E2" }, { label:"Lavanda",  hex:"#F3E8FF" },
];

// Common emojis for the picker
const EMOJI_LIST = ["😀","😊","🙏","❤️","✨","🔥","📖","⭐","🌟","💡","✅","🎯","🌿","🕊️","💎","🌈","🙌","💪","🤔","😔","😢","🎉","📝","🔑","⚡","🌱","🌺","🍃","☀️","🌙","⛅","🌊","🏔️","🦋","🐑","🦁","🐟","🌾","🍞","🍷","⚔️","🛡️","🏺","📜","🕍","✡️","🕌","🙏","✝️","📿","🎵","🎶","🌻","💐","🌷","🍀","🌍","🌎","🌏"];

// ── PDF via browser print (handles emojis, bold, italic, colors natively) ─────
function generateMonthPDF(month, progress) {
  const daysWithNotes = month.days.filter(day => {
    const d = progress[day.index] || {};
    return d.note || d.word || d.verse;
  });
  if (daysWithNotes.length === 0) { alert("Nenhuma anotação encontrada para este mês."); return; }

  const daysHtml = daysWithNotes.map(day => {
    const d = progress[day.index] || {};
    const noteHtml  = d.note  ? `<div class="field-label">Anotações da leitura</div><div class="field-body">${d.note}</div>` : "";
    const wordHtml  = d.word  ? `<div class="field-label">Resumo em uma frase</div><div class="field-plain">${d.word}</div>` : "";
    const verseHtml = d.verse ? `<div class="field-label">Passagem favorita</div><div class="field-plain">${d.verse}</div>` : "";
    return `
      <div class="day-block">
        <div class="day-header">
          <span class="day-title">Dia ${day.dayNum} — ${day.reading.toUpperCase()}</span>
          <span class="day-date">${day.dateLabel}</span>
        </div>
        ${noteHtml}${wordHtml}${verseHtml}
      </div>`;
  }).join("");

  const printHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Deus Todos os Dias — ${month.label}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; font-size: 11pt; color: #1A1A1A; background: #fff; padding: 0; }

  .cover {
    background: #F4D8B4;
    padding: 40px 48px 32px;
    margin-bottom: 32px;
    border-bottom: 2px solid #FA6C24;
  }
  .cover h1 { font-size: 22pt; font-weight: 700; color: #492F1A; text-align: center; margin-bottom: 6px; }
  .cover p  { font-size: 12pt; color: #BF9463; text-align: center; font-style: italic; }

  .day-block {
    padding: 0 48px 24px;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .day-block + .day-block { border-top: 1px solid #E8DDD0; padding-top: 24px; }

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #F4EEE7;
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 14px;
  }
  .day-title { font-size: 10pt; font-weight: 700; color: #492F1A; }
  .day-date  { font-size: 9pt;  color: #BF9463; }

  .field-label {
    font-size: 9pt;
    font-weight: 700;
    color: #492F1A;
    margin-bottom: 4px;
    margin-top: 12px;
  }
  .field-body {
    font-size: 10pt;
    line-height: 1.7;
    color: #1A1A1A;
  }
  .field-body ul { padding-left: 18px; list-style: disc; }
  .field-body ol { padding-left: 18px; list-style: decimal; }
  .field-body h1 { font-size: 16pt; font-weight: 700; margin: 6px 0 4px; }
  .field-body h2 { font-size: 13pt; font-weight: 700; margin: 6px 0 4px; }
  .field-body h3 { font-size: 11pt; font-weight: 700; margin: 6px 0 4px; }

  .field-plain {
    font-size: 10pt;
    font-style: italic;
    color: #444;
    line-height: 1.6;
  }

  @media print {
    body { padding: 0; }
    .cover { margin-bottom: 0; padding: 32px 48px 24px; }
    @page { margin: 0; size: A4; }
  }
</style>
</head>
<body>
  <div class="cover">
    <h1>✦ Deus Todos os Dias ✦</h1>
    <p>Anotações — ${month.label}</p>
  </div>
  ${daysHtml}
  <script>
    // Wait for fonts then print
    document.fonts.ready.then(() => { window.print(); });
  </script>
</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(printHtml);
  win.document.close();
}

// ── Global CSS ─────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html, body { background:${BODY_BG}; overflow-x:hidden; width:100%; -webkit-text-size-adjust:100%; }
  #root { overflow-x:hidden; width:100%; max-width:100vw; }
  ::-webkit-scrollbar { display:none; }
  * { scrollbar-width:none; }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes slideIn  { from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes openAcc  { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

  /* ── Notes screen ── */
  .notes-screen {
    position:fixed; inset:0; background:#fff; z-index:200;
    display:flex; flex-direction:column;
    animation: slideIn .22s cubic-bezier(.32,.72,0,1);
  }
  .notes-topbar {
    display:flex; align-items:center; gap:10px;
    padding:14px 16px 12px;
    background:#fff; border-bottom:1px solid #F0EAE0;
    flex-shrink:0;
  }
  .notes-body { flex:1; overflow-y:auto; padding:16px 16px 0; }
  .notes-footer { padding:12px 16px 32px; display:flex; gap:10px; border-top:1px solid #F0EAE0; flex-shrink:0; }

  /* ── Rich text editor ── */
  .rte-wrap { border:1px solid #E2D9C8; border-radius:10px; overflow:hidden; }
  .rte-toolbar {
    display:flex; align-items:center; gap:2px; flex-wrap:wrap;
    padding:6px 8px; background:#F9F5EF; border-bottom:1px solid #E2D9C8;
  }
  .rte-sep { width:1px; height:20px; background:#E2D9C8; margin:0 3px; flex-shrink:0; }
  .tb-btn {
    min-width:30px; height:30px; padding:0 6px; border:1px solid transparent;
    border-radius:6px; background:transparent; cursor:pointer;
    font-size:13px; color:${TITLE_CLR}; display:flex; align-items:center; justify-content:center;
    transition:background .12s; position:relative; flex-shrink:0;
  }
  .tb-btn:hover { background:#F4EEE7; border-color:#E2D9C8; }
  .tb-btn.active { background:#F4EEE7; border-color:${GOLD}; }
  .rte-editor {
    min-height:160px; max-height:320px; overflow-y:auto;
    padding:12px 14px; outline:none;
    font-family:${inter}; font-size:16px; color:#1A1A1A; line-height:1.7;
    background:#fff;
  }
  .rte-editor:empty:before { content:attr(data-placeholder); color:#C4A882; font-style:italic; pointer-events:none; }
  .rte-editor ul { list-style:disc; padding-left:20px; }
  .rte-editor ol { list-style:decimal; padding-left:20px; }
  .rte-editor h1 { font-size:22px; font-weight:700; margin-bottom:4px; }
  .rte-editor h2 { font-size:18px; font-weight:700; margin-bottom:4px; }
  .rte-editor h3 { font-size:15px; font-weight:700; margin-bottom:4px; }

  /* Dropdowns */
  .tb-dropdown {
    position:absolute; top:calc(100% + 4px); left:0; z-index:999;
    background:#fff; border:1px solid #E2D9C8; border-radius:10px;
    box-shadow:0 4px 16px rgba(0,0,0,0.12); min-width:160px; padding:6px;
  }
  .tb-dropdown-item {
    width:100%; padding:8px 10px; border:none; background:none; cursor:pointer;
    text-align:left; border-radius:6px; display:flex; align-items:center; gap:8px;
    font-family:${inter}; font-size:13px; color:#1A1A1A; transition:background .1s;
  }
  .tb-dropdown-item:hover { background:#F4EEE7; }

  /* Color picker */
  .color-grid { display:grid; grid-template-columns:repeat(7,28px); gap:4px; padding:8px; }
  .color-dot {
    width:28px; height:28px; border-radius:6px; border:1.5px solid rgba(0,0,0,0.1);
    cursor:pointer; transition:transform .1s;
  }
  .color-dot:hover { transform:scale(1.15); }

  /* Emoji picker */
  .emoji-picker {
    position:absolute; top:calc(100% + 4px); left:0; z-index:999;
    background:#fff; border:1px solid #E2D9C8; border-radius:10px;
    box-shadow:0 4px 16px rgba(0,0,0,0.12);
    width:260px; padding:8px;
  }
  .emoji-grid { display:grid; grid-template-columns:repeat(8,1fr); gap:2px; max-height:180px; overflow-y:auto; }
  .emoji-btn { font-size:20px; padding:4px; border:none; background:none; cursor:pointer; border-radius:4px; transition:background .1s; text-align:center; }
  .emoji-btn:hover { background:#F4EEE7; }

  /* Plain inputs */
  .plain-field {
    width:100%; padding:12px 14px; border:1px solid #E2D9C8; border-radius:10px;
    font-family:${inter}; font-size:16px; color:#1A1A1A;
    outline:none; background:#fff; transition:border-color .2s; line-height:1.6;
  }
  .plain-field:focus { border-color:${ORANGE}; }
  .plain-field::placeholder { color:#C4A882; font-style:italic; }

  /* Accordion */
  .acc-body { animation: openAcc .2s ease; }
`;

// ── Rich Text Editor ───────────────────────────────────────────────────────────
function RichTextEditor({ value, onChange }) {
  const edRef   = useRef(null);
  const skipRef = useRef(false);
  // null | "style" | "color" | "emoji"
  const [openDD, setOpenDD] = useState(null);

  useEffect(() => {
    if (edRef.current) { skipRef.current = true; edRef.current.innerHTML = value || ""; skipRef.current = false; }
  }, []); // mount only

  function exec(cmd, val = null) { edRef.current?.focus(); document.execCommand(cmd, false, val); sync(); }
  function sync() { if (!skipRef.current && edRef.current) onChange(edRef.current.innerHTML); }

  function toggle(name) { setOpenDD(v => v === name ? null : name); }
  function closeDD() { setOpenDD(null); }

  function applyStyle(tag) { edRef.current?.focus(); document.execCommand("formatBlock", false, tag); sync(); closeDD(); }
  function applyColor(hex) { exec("foreColor", hex); closeDD(); }
  function insertEmoji(em)  { exec("insertText", em);  closeDD(); }

  // Invisible backdrop — captures touch/click outside dropdown on iOS
  const Backdrop = () => openDD ? (
    <div
      style={{ position:"fixed", inset:0, zIndex:998 }}
      onMouseDown={closeDD}
      onTouchStart={closeDD}
    />
  ) : null;

  const TEXT_STYLES = [
    { label:"Texto normal", tag:"p",  fontSize:16, fontWeight:400 },
    { label:"Título 1",     tag:"h1", fontSize:22, fontWeight:700 },
    { label:"Título 2",     tag:"h2", fontSize:18, fontWeight:700 },
    { label:"Título 3",     tag:"h3", fontSize:15, fontWeight:700 },
  ];

  // Unified toolbar button tap — works on both desktop and iOS
  function tbTap(e, action) {
    e.preventDefault();
    e.stopPropagation();
    action();
  }

  return (
    <div className="rte-wrap">
      <Backdrop />
      <div className="rte-toolbar">

        {/* Text style */}
        <div style={{ position:"relative", zIndex: openDD === "style" ? 999 : "auto" }}>
          <button className={`tb-btn${openDD==="style"?" active":""}`}
            onPointerDown={e=>tbTap(e, ()=>toggle("style"))}>
            <span style={{ fontFamily:calSans, fontSize:11, whiteSpace:"nowrap" }}>Aa ▾</span>
          </button>
          {openDD === "style" && (
            <div className="tb-dropdown" style={{ minWidth:180 }}>
              {TEXT_STYLES.map(s => (
                <button key={s.tag} className="tb-dropdown-item"
                  style={{ fontSize:s.fontSize, fontWeight:s.fontWeight }}
                  onPointerDown={e=>tbTap(e, ()=>applyStyle(s.tag))}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rte-sep" />

        {/* Bold / Italic / Underline */}
        <button className="tb-btn" onPointerDown={e=>tbTap(e, ()=>exec("bold"))}>
          <b style={{ fontSize:14 }}>B</b>
        </button>
        <button className="tb-btn" onPointerDown={e=>tbTap(e, ()=>exec("italic"))}>
          <i style={{ fontSize:14 }}>I</i>
        </button>
        <button className="tb-btn" onPointerDown={e=>tbTap(e, ()=>exec("underline"))}>
          <u style={{ fontSize:14 }}>U</u>
        </button>

        <div className="rte-sep" />

        {/* Lists */}
        <button className="tb-btn" onPointerDown={e=>tbTap(e, ()=>exec("insertUnorderedList"))}>
          <svg width="15" height="13" viewBox="0 0 15 13" fill="none">
            <circle cx="2" cy="2.5" r="1.5" fill="currentColor"/>
            <rect x="5.5" y="1.5" width="9" height="2" rx="1" fill="currentColor"/>
            <circle cx="2" cy="6.5" r="1.5" fill="currentColor"/>
            <rect x="5.5" y="5.5" width="9" height="2" rx="1" fill="currentColor"/>
            <circle cx="2" cy="10.5" r="1.5" fill="currentColor"/>
            <rect x="5.5" y="9.5" width="9" height="2" rx="1" fill="currentColor"/>
          </svg>
        </button>
        <button className="tb-btn" onPointerDown={e=>tbTap(e, ()=>exec("insertOrderedList"))}>
          <svg width="15" height="13" viewBox="0 0 15 13" fill="none">
            <text x="0" y="4.5" fontSize="5.5" fontFamily="monospace" fill="currentColor">1.</text>
            <rect x="5.5" y="1.5" width="9" height="2" rx="1" fill="currentColor"/>
            <text x="0" y="8.5" fontSize="5.5" fontFamily="monospace" fill="currentColor">2.</text>
            <rect x="5.5" y="5.5" width="9" height="2" rx="1" fill="currentColor"/>
            <text x="0" y="12.5" fontSize="5.5" fontFamily="monospace" fill="currentColor">3.</text>
            <rect x="5.5" y="9.5" width="9" height="2" rx="1" fill="currentColor"/>
          </svg>
        </button>

        <div className="rte-sep" />

        {/* Color picker */}
        <div style={{ position:"relative", zIndex: openDD === "color" ? 999 : "auto" }}>
          <button className={`tb-btn${openDD==="color"?" active":""}`}
            onPointerDown={e=>tbTap(e, ()=>toggle("color"))}>
            <span style={{ fontFamily:"serif", fontWeight:700, fontSize:14, color:TITLE_CLR }}>A</span>
            <span style={{ display:"block", width:14, height:3, background:ORANGE, borderRadius:1, marginTop:1 }}/>
          </button>
          {openDD === "color" && (
            <div className="tb-dropdown" style={{ minWidth:"auto", padding:0 }}>
              <div style={{ padding:"8px 8px 4px", fontSize:11, fontWeight:600, color:"#888", fontFamily:calSans }}>Cor do texto</div>
              <div className="color-grid">
                {TEXT_COLORS.map(c => (
                  <div key={c.hex} className="color-dot"
                    style={{ background:c.hex, outline:c.hex==="#FFFFFF"?"1.5px solid #ccc":"none" }}
                    onPointerDown={e=>tbTap(e, ()=>applyColor(c.hex))} />
                ))}
              </div>
              <div style={{ padding:"4px 8px 8px" }}>
                <button className="tb-dropdown-item"
                  style={{ borderTop:"1px solid #F0EAE0", paddingTop:8, marginTop:2 }}
                  onPointerDown={e=>tbTap(e, ()=>{ exec("removeFormat"); closeDD(); })}>
                  Remover cor
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Emoji picker */}
        <div style={{ position:"relative", zIndex: openDD === "emoji" ? 999 : "auto" }}>
          <button className={`tb-btn${openDD==="emoji"?" active":""}`}
            onPointerDown={e=>tbTap(e, ()=>toggle("emoji"))}>
            <span style={{ fontSize:15 }}>😊</span>
          </button>
          {openDD === "emoji" && (
            <div className="emoji-picker">
              <div style={{ fontSize:11, fontWeight:600, color:"#888", fontFamily:calSans, marginBottom:6 }}>Emojis</div>
              <div className="emoji-grid">
                {EMOJI_LIST.map(em => (
                  <button key={em} className="emoji-btn"
                    onPointerDown={e=>tbTap(e, ()=>insertEmoji(em))}>{em}</button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      <div ref={edRef} className="rte-editor" contentEditable suppressContentEditableWarning
        data-placeholder="Escreva suas reflexões e insights sobre a leitura..."
        onInput={sync}
        onFocus={closeDD}
      />
    </div>
  );
}

// ── ProgressBar ────────────────────────────────────────────────────────────────
function ProgressBar({ pct }) {
  return (
    <div style={{ height:6, background:"rgba(0,0,0,0.09)", borderRadius:99, overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, height:"100%", borderRadius:99, background:`linear-gradient(90deg,#C03A10,${ORANGE})`, transition:"width .4s ease", minWidth:pct>0?14:0 }} />
    </div>
  );
}

// ── BookIntro accordion ────────────────────────────────────────────────────────
function BookIntro({ book }) {
  const [open, setOpen] = useState(false);
  const intro = BOOK_INTROS[book];
  if (!intro) return null;
  return (
    <div style={{ marginBottom:10, borderRadius:12, border:`1px solid rgba(191,148,99,0.3)`, overflow:"hidden", background:"#FFFBF6" }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ width:"100%", padding:"13px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer", fontFamily:calSans, fontSize:13, color:TITLE_CLR, textAlign:"left", gap:8 }}>
        <span style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:15 }}>📖</span><span>Introdução a {book}</span></span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0, transition:"transform .2s", transform:open?"rotate(180deg)":"rotate(0deg)" }}>
          <path d="M2 4.5l5 5 5-5" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="acc-body" style={{ padding:"0 16px 16px", borderTop:`1px solid rgba(191,148,99,0.2)`, fontSize:13, lineHeight:1.75, color:"#444", fontFamily:inter }}>
          <p style={{ marginTop:12 }}>{intro}</p>
        </div>
      )}
    </div>
  );
}

function buildItems(days) {
  const items = []; let lastBook = null;
  days.forEach(day => {
    if (day.book !== lastBook) { items.push({ type:"intro", book:day.book, key:`intro-${day.book}-${day.index}` }); lastBook = day.book; }
    items.push({ type:"day", day, key:`day-${day.index}` });
  });
  return items;
}

// ── Notes Screen ───────────────────────────────────────────────────────────────
function NotesScreen({ day, initial, onSave, onCancel }) {
  const [note, setNote]   = useState(initial.note  || "");
  const [word, setWord]   = useState(initial.word  || "");
  const [verse, setVerse] = useState(initial.verse || "");

  return (
    <div className="notes-screen">
      {/* Top bar */}
      <div className="notes-topbar">
        <button onClick={onCancel} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", padding:"4px 0", fontFamily:inter, fontSize:14, color:TITLE_CLR }}>
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
            <path d="M7.5 1.5L2 7.5l5.5 6" stroke={TITLE_CLR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>
        <div style={{ flex:1, textAlign:"center" }}>
          <div style={{ fontFamily:calSans, fontWeight:600, fontSize:13, color:GOLD }}>Dia {day.dayNum} · {day.dateLabel}</div>
          <div style={{ fontFamily:calSans, fontWeight:700, fontSize:15, color:TITLE_CLR, textTransform:"uppercase", letterSpacing:".04em", lineHeight:1.2 }}>{day.reading}</div>
        </div>
        <div style={{ width:60 }} /> {/* spacer */}
      </div>

      {/* Scrollable body */}
      <div className="notes-body">
        <div style={{ marginBottom:22 }}>
          <label style={{ display:"block", fontFamily:calSans, fontSize:13, fontWeight:600, color:"#1A1A1A", marginBottom:8 }}>Anotações da leitura</label>
          <RichTextEditor key={day.index} value={note} onChange={setNote} />
        </div>

        <div style={{ marginBottom:22 }}>
          <label style={{ display:"block", fontFamily:calSans, fontSize:13, fontWeight:600, color:"#1A1A1A", marginBottom:8 }}>Resumo em uma frase</label>
          <input className="plain-field" type="text" placeholder="Uma frase que resume essa leitura" value={word} onChange={e=>setWord(e.target.value)} style={{ display:"block" }} />
        </div>

        <div style={{ marginBottom:22 }}>
          <label style={{ display:"block", fontFamily:calSans, fontSize:13, fontWeight:600, color:"#1A1A1A", marginBottom:8 }}>Passagem favorita</label>
          <input className="plain-field" type="text" placeholder="Versículo que mais tocou o seu coração" value={verse} onChange={e=>setVerse(e.target.value)} style={{ display:"block" }} />
        </div>
      </div>

      {/* Footer buttons */}
      <div className="notes-footer">
        <button onClick={onCancel} style={{ flex:1, padding:"14px", background:"#fff", border:"1.5px solid #DDD", borderRadius:50, fontFamily:calSans, fontWeight:500, fontSize:14, color:"#1A1A1A", cursor:"pointer" }}>
          Cancelar
        </button>
        <button onClick={()=>onSave({ note, word, verse })} style={{ flex:1, padding:"14px", background:BROWN, border:"none", borderRadius:50, fontFamily:calSans, fontWeight:600, fontSize:14, color:"#fff", cursor:"pointer" }}>
          Salvar
        </button>
      </div>
    </div>
  );
}

// ── Login Screen ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, loading }) {
  return (
    <div style={{ minHeight:"100vh", background:HEADER_BG, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div style={{ fontFamily:calSans, fontSize:28, fontWeight:600, color:TITLE_CLR, marginBottom:8, textAlign:"center" }}>
        ✦ Deus todos os dias ✦
      </div>
      <div style={{ fontFamily:inter, fontSize:14, color:GOLD, marginBottom:48, textAlign:"center", fontStyle:"italic" }}>
        Bíblia em Um Ano · NVI
      </div>

      <div style={{ background:"#fff", borderRadius:20, padding:"32px 28px", width:"100%", maxWidth:360, boxShadow:"0 4px 24px rgba(73,47,26,0.1)", textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🙏</div>
        <div style={{ fontFamily:calSans, fontSize:17, color:TITLE_CLR, marginBottom:8 }}>
          Bem-vinda de volta
        </div>
        <div style={{ fontFamily:inter, fontSize:13, color:"#888", lineHeight:1.6, marginBottom:28 }}>
          Entre com sua conta Google para acessar suas leituras e anotações em qualquer dispositivo.
        </div>

        <button
          onClick={onLogin}
          disabled={loading}
          style={{ width:"100%", padding:"14px 20px", background: loading ? "#f5f5f5" : BROWN, border:"none", borderRadius:50, display:"flex", alignItems:"center", justifyContent:"center", gap:10, cursor: loading ? "default" : "pointer", fontFamily:calSans, fontSize:15, fontWeight:600, color: loading ? "#aaa" : "#fff", transition:"opacity .2s" }}
        >
          {loading ? (
            <span>Entrando...</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Entrar com Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [user,     setUser]     = useState(null);
  const [authReady,setAuthReady]= useState(false);
  const [loggingIn,setLoggingIn]= useState(false);
  const [progress, setProgress] = useState({});
  const [loaded,   setLoaded]   = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [activeM,  setActiveM]  = useState(0);
  const [selDay,   setSelDay]   = useState(null);
  const tabsRef   = useRef(null);
  const saveTimer = useRef(null);

  const today = new Date(); today.setHours(0,0,0,0);
  const todayIdx = Math.floor((today.getTime() - START.getTime()) / 86400000);

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // ── Load from Firestore when user is ready ─────────────────────────────────
  useEffect(() => {
    if (!user) { setLoaded(false); setProgress({}); return; }
    (async () => {
      try {
        const ref  = doc(db, "users", user.uid, "dtod", "progress");
        const snap = await getDoc(ref);
        if (snap.exists()) setProgress(snap.data().data || {});
      } catch (e) { console.error("Load error", e); }
      setLoaded(true);
    })();
  }, [user]);

  // ── Save to Firestore (debounced 800ms) ────────────────────────────────────
  async function saveP(p) {
    setProgress(p);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!user) return;
      setSaving(true);
      try {
        const ref = doc(db, "users", user.uid, "dtod", "progress");
        await setDoc(ref, { data: p }, { merge: true });
      } catch (e) { console.error("Save error", e); }
      setSaving(false);
    }, 800);
  }

  // ── Google login ───────────────────────────────────────────────────────────
  async function handleLogin() {
    setLoggingIn(true);
    try { await signInWithPopup(auth, provider); }
    catch (e) { console.error("Login error", e); }
    setLoggingIn(false);
  }

  async function handleLogout() {
    await signOut(auth);
    setProgress({});
    setLoaded(false);
  }

  // ── Month tabs scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    const key = `${today.getFullYear()}-${today.getMonth()}`;
    const idx = MONTHS.findIndex(m => m.key === key);
    setActiveM(idx >= 0 ? idx : 0);
  }, []);

  useEffect(() => {
    if (!tabsRef.current) return;
    const el = tabsRef.current.querySelector("[data-active='true']");
    if (el) el.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" });
  }, [activeM]);

  function toggleDay(idx) {
    saveP({ ...progress, [idx]: { ...(progress[idx]||{}), completed: !progress[idx]?.completed } });
  }

  function handleSave(data) {
    saveP({ ...progress, [selDay.index]: { ...(progress[selDay.index]||{}), ...data } });
    setSelDay(null);
  }

  const totalDone  = Object.values(progress).filter(d => d.completed).length;
  const overallPct = Math.round((totalDone / 365) * 100);
  const month      = MONTHS[activeM];
  const mDone      = month ? month.days.filter(d => progress[d.index]?.completed).length : 0;
  const mPct       = month ? Math.round((mDone / month.days.length) * 100) : 0;

  // ── Render states ──────────────────────────────────────────────────────────
  if (!authReady) return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:HEADER_BG, fontFamily:inter, color:GOLD, fontSize:15 }}>
      ✦
    </div>
  );

  if (!user) return (
    <>
      <style>{CSS}</style>
      <LoginScreen onLogin={handleLogin} loading={loggingIn} />
    </>
  );

  if (!loaded) return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:BODY_BG, fontFamily:inter, color:GOLD, gap:12 }}>
      <div style={{ fontSize:24 }}>🙏</div>
      <div style={{ fontSize:14, color:"#999" }}>Carregando suas leituras...</div>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:BODY_BG, fontFamily:inter, color:"#1A1A1A", fontSize:14 }}>

        {/* ── Header + Tabs ── */}
        <div style={{ position:"sticky", top:0, zIndex:100 }}>
          <div style={{ background:HEADER_BG, padding:"18px 18px 16px" }}>
            {/* User info + logout */}
            <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:8, marginBottom:10 }}>
              {saving && <span style={{ fontSize:11, color:GOLD, fontStyle:"italic" }}>Salvando...</span>}
              <img src={user.photoURL} alt="" style={{ width:26, height:26, borderRadius:"50%", border:`1.5px solid ${GOLD}` }} />
              <button onClick={handleLogout} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:GOLD, fontFamily:inter, padding:0 }}>
                Sair
              </button>
            </div>

            <div style={{ fontFamily:calSans, fontWeight:600, fontSize:22, textAlign:"center", color:TITLE_CLR, marginBottom:14 }}>
              ✦ Deus todos os dias ✦
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:13, color:TITLE_CLR }}>{totalDone} de 365 dias</span>
              <span style={{ fontSize:13, color:TITLE_CLR }}>{overallPct}%</span>
            </div>
            <ProgressBar pct={overallPct} />
          </div>

          <div ref={tabsRef} style={{ overflowX:"auto", display:"flex", background:"#FFFFFF", borderBottom:"1px solid rgba(0,0,0,0.07)", padding:"0 4px" }}>
            {MONTHS.map((m, i) => {
              const active = i === activeM;
              return (
                <button key={m.key} data-active={active} onClick={()=>setActiveM(i)} style={{ flexShrink:0, padding:"12px 14px 10px", background:"none", border:"none", borderBottom:active?`2px solid ${TAB_LINE}`:"2px solid transparent", color:active?TITLE_CLR:TAB_INACT, fontFamily:calSans, fontWeight:active?700:400, fontSize:12, cursor:"pointer", whiteSpace:"nowrap", letterSpacing:".04em", transition:"color .15s", marginBottom:-1 }}>
                  {m.short}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Month content ── */}
        {month && (
          <div style={{ padding:"0 14px 80px", background:BODY_BG }}>
            <div style={{ padding:"16px 2px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontFamily:calSans, fontWeight:600, fontSize:22, color:"#1A1A1A" }}>{month.label}</div>
                <button onClick={()=>generateMonthPDF(month,progress)} title="Baixar anotações em PDF"
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", background:"#fff", border:`1px solid rgba(191,148,99,0.4)`, borderRadius:99, fontFamily:calSans, fontSize:12, color:TITLE_CLR, cursor:"pointer", flexShrink:0 }}>
                  <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
                    <path d="M6.5 1v8M3.5 6.5l3 3 3-3" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 11h11" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  PDF
                </button>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:13, color:"#777" }}>{mDone} de {month.days.length} concluídos</span>
                <span style={{ fontSize:13, color:"#777" }}>{mPct}%</span>
              </div>
              <ProgressBar pct={mPct} />
            </div>

            {buildItems(month.days).map(item => {
              if (item.type === "intro") return <BookIntro key={item.key} book={item.book} />;
              const { day } = item;
              const d = progress[day.index] || {};
              const done      = !!d.completed;
              const isToday   = day.index === todayIdx;
              const isTomorrow= day.index === todayIdx + 1;
              const isPastDue = !done && day.index < todayIdx;
              const hasNotes  = !!(d.note || d.word || d.verse);

              // Badge colours
              // Hoje    → orange bg + orange text
              // Amanhã  → yellow bg + yellow-brown text
              // Atrasado→ same orange palette as Hoje
              const BADGE_HOJE     = { bg:"#FDEDED", color:"#E8501A" };
              const BADGE_AMANHA   = { bg:"#FEF9E7", color:"#B7770D" };
              const BADGE_ATRASADO = { bg:"#FDEDED", color:"#E8501A" };

              return (
                <div key={item.key} onClick={()=>setSelDay(day)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:done?CARD_DONE:"#FFFFFF", borderRadius:14, marginBottom:8, cursor:"pointer", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", outline:isToday?`2px solid ${ORANGE}`:"none", transition:"background .15s" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0, width:34 }}>
                    <span style={{ fontSize:20, lineHeight:1 }}>{CAL}</span>
                    <span style={{ fontSize:10, color:"#999", fontWeight:500 }}>{day.dateLabel}</span>
                  </div>
                  <div onClick={e=>{e.stopPropagation();toggleDay(day.index);}} style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, cursor:"pointer", border:done?"none":"1.5px solid #C8C0B4", background:done?"#4CAF50":"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
                    {done&&<svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3, flexWrap:"wrap" }}>
                      <span style={{ fontSize:13, fontWeight:600, color:done?"#AAA":"#1A1A1A" }}>Dia {day.dayNum}</span>
                      {isToday    && <span style={{ fontSize:10, fontWeight:700, background:BADGE_HOJE.bg,     color:BADGE_HOJE.color,     padding:"2px 8px", borderRadius:99, lineHeight:1.5 }}>Hoje</span>}
                      {isTomorrow && !done && <span style={{ fontSize:10, fontWeight:700, background:BADGE_AMANHA.bg,   color:BADGE_AMANHA.color,   padding:"2px 8px", borderRadius:99, lineHeight:1.5 }}>Amanhã</span>}
                      {isPastDue  && <span style={{ fontSize:10, fontWeight:700, background:BADGE_ATRASADO.bg, color:BADGE_ATRASADO.color, padding:"2px 8px", borderRadius:99, lineHeight:1.5 }}>Atrasado</span>}
                      {hasNotes && !isToday && !isTomorrow && !isPastDue && <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:"#C4A882" }}/>}
                    </div>
                    <div style={{ fontSize:13, color:done?"#BBB":"#555", textDecoration:done?"line-through":"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{day.reading}</div>
                  </div>
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ flexShrink:0 }}><path d="M1 1l5 5-5 5" stroke="#C8C0B4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Full-screen notes page ── */}
        {selDay && (
          <NotesScreen
            day={selDay}
            initial={progress[selDay.index] || {}}
            onSave={handleSave}
            onCancel={()=>setSelDay(null)}
          />
        )}
      </div>
    </>
  );
}
