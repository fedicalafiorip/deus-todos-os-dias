import { useState, useEffect, useRef, useCallback } from "react";
import { jsPDF } from "jspdf";

// ── Book introductions ────────────────────────────────────────────────────────
const BOOK_INTROS = {
  "Gênesis": "Gênesis é o primeiro livro da Bíblia e conta a origem de tudo: do mundo, da humanidade e do povo de Deus. Começa com a criação do universo e histórias como Adão e Eva, Noé e o dilúvio. Depois foca na família de Abraão — pai da fé — cujas promessas continuam com Isaque, Jacó e José. De forma geral, Gênesis fala sobre começos, erros humanos, fé e a relação entre Deus e as pessoas.",
  "Êxodo": "Êxodo conta a história da libertação do povo de Israel da escravidão no Egito. Deus chama Moisés para liderar o povo e envia as famosas dez pragas sobre o Egito. Após a saída miraculosa — incluindo a abertura do Mar Vermelho — Israel caminha pelo deserto. No monte Sinai, Deus entrega os Dez Mandamentos e instrui a construção do tabernáculo, o lugar de sua presença.",
  "Levítico": "Levítico é o manual de santidade de Israel. Contém leis sobre sacrifícios, pureza, sacerdócio e festas religiosas. O nome vem dos levitas, a tribo responsável pelo culto. O tema central é a santidade: Deus é santo e chama o seu povo a ser santo também. Embora pareça técnico, Levítico revela o cuidado de Deus em ensinar seu povo a se aproximar dele.",
  "Números": "Números narra a jornada de Israel pelo deserto entre o Sinai e a terra prometida. O livro começa com um recenseamento do povo — daí o nome. Registra momentos de fé e muitas reclamações, rebeliões e julgamentos. Mesmo com fracassos, a fidelidade de Deus nunca falha. É uma história de formação de um povo que aprende a confiar em Deus no caminho.",
  "Deuteronômio": "Deuteronômio são os discursos de despedida de Moisés ao povo de Israel às margens da terra prometida. O nome significa 'segunda lei' — Moisés relembra e aprofunda as leis dadas no Sinai. O livro chama o povo à obediência, ao amor a Deus e à memória do que ele fez. Termina com a morte de Moisés e a passagem da liderança para Josué.",
  "Josué": "Josué narra a conquista e divisão da terra de Canaã pelo povo de Israel. Josué, sucessor de Moisés, lidera o povo com fé — a travessia do Jordão e a queda de Jericó são momentos marcantes. O livro mostra que as promessas de Deus se cumprem quando o povo caminha em obediência. Termina com o desafio de Josué: 'Eu e minha casa, serviremos ao Senhor.'",
  "Juízes": "Juízes relata um ciclo repetido na história de Israel: o povo se afasta de Deus, cai em opressão, clama por ajuda e Deus levanta um juiz libertador. Figuras como Débora, Gideão e Sansão aparecem neste livro. É uma narrativa honesta sobre a inconstância humana e a misericórdia persistente de Deus.",
  "Rute": "Rute é uma história de fidelidade, amor e redenção. Uma mulher moabita chamada Rute escolhe permanecer com sua sogra Noemi. A lealdade de Rute é recompensada quando ela encontra Boaz, um parente redentor que a acolhe. É um livro breve e belo, que mostra como Deus cuida dos humildes.",
  "1 Samuel": "1 Samuel marca a transição de Israel de uma nação governada por juízes para uma monarquia. O livro acompanha Samuel, que unge os dois primeiros reis: Saul e Davi. O contraste entre Saul e Davi — um homem segundo o coração de Deus — é o coração do livro.",
  "2 Samuel": "2 Samuel acompanha o reinado de Davi como rei unificado de Israel. É uma história de glórias e fracassos: Davi conquista Jerusalém, mas também comete pecados graves e enfrenta consequências dolorosas dentro de sua própria família.",
  "1 Reis": "1 Reis começa com o reinado de Salomão em todo o seu esplendor: a construção do Templo e a sabedoria famosa. Mas Salomão se desvia de Deus ao final. Após sua morte, o reino se divide. O livro termina com a figura do profeta Elias.",
  "2 Reis": "2 Reis continua a história do reino dividido. O livro culmina com dois eventos devastadores: a queda do reino do norte pelos assírios e a queda de Jerusalém pelos babilônios, com o povo levado ao exílio.",
  "1 Crônicas": "1 Crônicas retoma a história de Israel com foco teológico, começando com genealogias que vão de Adão até Davi. O livro enfatiza o reinado de Davi e sua preparação para a construção do Templo.",
  "2 Crônicas": "2 Crônicas narra o reinado de Salomão e a construção do Templo, depois acompanha os reis de Judá até a queda de Jerusalém. Diferente de Reis, destaca os momentos de reforma e renovação espiritual.",
  "Esdras": "Esdras narra o retorno dos judeus do exílio na Babilônia para Jerusalém. A primeira onda foca na reconstrução do Templo. A segunda é liderada pelo próprio Esdras, escriba e sacerdote que ensina a Lei de Deus ao povo.",
  "Neemias": "Neemias é a história de um homem de oração e ação. Copeiro do rei persa, Neemias obtém permissão para reconstruir os muros de Jerusalém e lidera a obra apesar de forte oposição.",
  "Ester": "Ester é uma história de coragem e providência divina. Uma jovem judia se torna rainha da Pérsia e arrisca a vida para salvar seu povo de um decreto de extermínio. 'Para um momento como este' resume a mensagem central.",
  "Jó": "Jó trata do sofrimento humano e da soberania de Deus. Jó, um homem justo, perde tudo. O próprio Deus responde a Jó do meio do redemoinho. Jó não recebe todas as respostas, mas encontra Deus — e isso é suficiente.",
  "Salmos": "Salmos é o livro de canções e orações de Israel — e da humanidade. São 150 poemas que expressam toda a gama de emoções humanas diante de Deus: alegria, lamento, gratidão, desespero, confiança e adoração.",
  "Provérbios": "Provérbios é um manual de sabedoria para a vida prática. Escrito principalmente por Salomão, ensina como viver com integridade, sabedoria e temor a Deus no dia a dia. A sabedoria começa com o 'temor ao Senhor'.",
  "Eclesiastes": "Eclesiastes é a reflexão de um rei sábio sobre o sentido da vida. 'Vaidade das vaidades' é o mote do livro — sem Deus, tudo é fugaz. A conclusão é simples e profunda: teme a Deus e guarda seus mandamentos.",
  "Cantares": "Cantares é um poema lírico sobre o amor entre um homem e uma mulher. Seu lugar na Bíblia fala da beleza e santidade do amor humano. Ao longo da história, também foi lido como uma metáfora do amor de Deus pelo seu povo.",
  "Isaías": "Isaías é o maior dos profetas escritores, chamado de 'o Evangelho do Antigo Testamento'. Os capítulos 40-66 trazem consolação profunda e as famosas profecias do Servo Sofredor, que apontam para Jesus com clareza impressionante.",
  "Jeremias": "Jeremias foi chamado de 'profeta das lágrimas'. Sua missão foi anunciar o juízo de Deus sobre Judá. Ele sofreu perseguições e rejeição, mas também profetizou uma nova aliança que Deus faria com seu povo.",
  "Lamentações": "Lamentações são cinco poemas de luto pela destruição de Jerusalém. No coração do livro há uma declaração de esperança: 'As misericórdias do Senhor não têm fim; renovam-se a cada manhã.' O lamento não nega a fé.",
  "Ezequiel": "Ezequiel foi um profeta que ministrou entre os exilados na Babilônia. Seu livro é cheio de visões extraordinárias — a glória de Deus, o vale dos ossos secos, o templo celestial. Ele anunciou julgamento e também restauração.",
  "Daniel": "Daniel foi levado jovem para a Babilônia e manteve-se fiel a Deus. Seu livro tem duas partes: histórias de fidelidade (a fornalha, a cova dos leões) e visões apocalípticas sobre impérios e o reino de Deus.",
  "Oséias": "Oséias foi chamado a casar com uma mulher infiel como símbolo do relacionamento de Deus com Israel. O amor persistente de Oséias por sua esposa ilustra o amor inabalável de Deus pelo seu povo.",
  "Joel": "Joel profetizou após uma invasão devastadora de gafanhotos. Ele interpreta o desastre como chamado ao arrependimento e anuncia que Deus derramará seu Espírito sobre toda a carne — citado por Pedro no Pentecostes.",
  "Amós": "Amós era um pastor quando Deus o chamou para profetizar. Seu recado foi contundente: Deus não aceita adoração religiosa acompanhada de injustiça social. 'Que a justiça flua como água' — essa é a exigência de Deus.",
  "Obadias": "Obadias é o menor livro do Antigo Testamento — apenas 21 versículos. É uma profecia de julgamento contra Edom, nação vizinha que se alegrou com a queda de Jerusalém. Também promete restauração para o povo de Deus.",
  "Jonas": "Jonas é a história do único profeta enviado a uma nação estrangeira. Chamado a pregar em Nínive, Jonas foge na direção oposta. Engolido por um grande peixe, ele finalmente obedece. O livro questiona: você quer a graça de Deus só para você?",
  "Miquéias": "Miquéias condena a corrupção e injustiça social, mas anuncia esperança messiânica. O resumo mais famoso da fé está em Miquéias 6.8: 'Agir com justiça, amar a misericórdia e andar humildemente com Deus.'",
  "Naum": "Naum profetizou a queda de Nínive, capital da Assíria. O livro afirma que Deus é lento para irar-se, mas não deixa impune os que persistem no mal. Nínive caiu em 612 a.C., exatamente como profetizado.",
  "Habacuque": "Habacuque ousa questionar Deus diretamente. O livro é um diálogo honesto entre o profeta e Deus. A resposta divina convida à confiança: 'O justo viverá pela sua fé.' Termina com um dos mais belos hinos de confiança da Bíblia.",
  "Sofonias": "Sofonias anuncia o 'Dia do Senhor' sobre Judá e as nações. Mas o livro termina com beleza: em Sofonias 3.17, Deus declara que se alegra sobre o seu povo com cantos.",
  "Ageu": "Ageu profetizou logo após o retorno do exílio, quando o povo havia deixado o Templo em ruínas. Com dois sermões práticos, convoca o povo a retomar a obra. O livro ensina sobre prioridades na vida com Deus.",
  "Zacarias": "Zacarias profetizou para encorajar o povo no retorno do exílio. Seu livro é cheio de visões simbólicas e profecias messiânicas impressionantes — o rei em um jumento, o pastor traído por 30 moedas de prata.",
  "Malaquias": "Malaquias é o último livro do Antigo Testamento. O povo estava em apatia espiritual. Malaquias termina anunciando a vinda de um mensageiro — cumprida em João Batista.",
  "Mateus": "Mateus apresenta Jesus como o Messias prometido. O livro está estruturado em cinco grandes discursos, sendo o primeiro o Sermão do Monte. Termina com a Grande Comissão: ir e fazer discípulos de todas as nações.",
  "Marcos": "Marcos é o Evangelho mais curto e dinâmico. Apresenta Jesus como um servo poderoso em ação: curando, ensinando e exercendo autoridade. O ponto central: 'Quem é este homem?' — a resposta está na cruz.",
  "Lucas": "Lucas escreveu o Evangelho mais completo sobre a humanidade de Jesus. Ele dá voz a quem a sociedade ignorava: mulheres, pobres, samaritanos, pecadores. Parábolas exclusivas como o Filho Pródigo e o Bom Samaritano aparecem aqui.",
  "João": "João é mais reflexivo e teológico. Começa com 'No princípio era o Verbo.' Sete sinais milagrosos e sete 'Eu sou' de Jesus marcam o livro. O propósito: que o leitor creia que Jesus é o Cristo e, crendo, tenha vida em seu nome.",
  "Atos": "Atos é a história do nascimento e expansão da Igreja. Começa com o Pentecostes em Jerusalém. De lá, a mensagem de Jesus se espalha pelo mundo — especialmente através do ministério do apóstolo Paulo.",
  "Romanos": "Romanos é a mais sistemática das cartas de Paulo — uma exposição completa do evangelho. Paulo apresenta o problema do pecado, a solução na justificação pela fé em Cristo e a vida nova pelo Espírito.",
  "1 Coríntios": "1 Coríntios foi escrita para uma igreja dividida e cheia de problemas. Paulo responde com sabedoria e firmeza, entregando joias como o capítulo 13 sobre o amor e o capítulo 15 sobre a ressurreição.",
  "2 Coríntios": "2 Coríntios é a carta mais pessoal de Paulo. Ele abre seu coração sobre sofrimentos, fraquezas e graça. 'A minha graça é suficiente para ti' é dita a Paulo em meio a suas fraquezas.",
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
  "Hebreus": "Hebreus foi escrita para cristãos de origem judaica. O argumento central: Jesus é superior a tudo. Ele é o sumo sacerdote perfeito. O famoso 'hall da fé' do capítulo 11 celebra os heróis da fé ao longo das eras.",
  "Tiago": "Tiago é uma carta prática sobre fé que se prova em ações. 'A fé sem obras é morta.' O livro trata do uso da língua, favoritismo, riqueza e oração. A fé genuína produz frutos visíveis na vida.",
  "1 Pedro": "1 Pedro foi escrita para cristãos enfrentando sofrimento e perseguição. Pedro os chama de 'estrangeiros e peregrinos'. O livro ensina como viver com esperança e santidade em meio à adversidade.",
  "2 Pedro": "2 Pedro alerta contra falsos mestres. Pedro chama os crentes a crescer em conhecimento e virtude, e lembra que a promessa da volta de Cristo é certa.",
  "1 João": "1 João combate heresias e apresenta três testes da vida cristã genuína: crer na verdade sobre Jesus, obedecer aos mandamentos e amar os irmãos. 'Deus é amor' aparece aqui com profundidade.",
  "2 João": "2 João é uma carta brevíssima que exorta ao amor mútuo e alerta contra receber aqueles que negam a doutrina de Cristo. A verdade e o amor andam juntos.",
  "3 João": "3 João elogia Gaio por sua hospitalidade e contrasta com Diótrefes, um líder orgulhoso. É uma janela para os desafios da liderança nas igrejas do primeiro século.",
  "Judas": "Judas é uma carta urgente de alerta contra falsos mestres que distorciam a graça de Deus. Termina com uma das mais belas doxologias da Bíblia.",
  "Apocalipse": "Apocalipse é a grande revelação dada ao apóstolo João. Escrito em linguagem simbólica para cristãos sob perseguição, revela que Cristo é o Senhor da história. O ponto central: o Cordeiro venceu. A história termina com Deus habitando com a humanidade para sempre.",
};

function getBook(reading) {
  return reading.replace(/\s+\d[\d,-]*$/, "").trim();
}

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
  return {
    index: i, dayNum: i + 1, date, reading,
    book: getBook(reading),
    monthKey: `${y}-${m}`,
    monthLabel: `${MONTHS_PT[m]} ${y}`,
    monthShort: `${MONTHS_SH[m]}/${String(y).slice(2)}`,
    dateLabel: `${String(date.getDate()).padStart(2,"0")}/${String(m+1).padStart(2,"0")}`,
  };
});

const MONTHS = [];
const mMap = {};
DAYS.forEach(day => {
  if (!mMap[day.monthKey]) {
    mMap[day.monthKey] = { key: day.monthKey, label: day.monthLabel, short: day.monthShort, days: [] };
    MONTHS.push(mMap[day.monthKey]);
  }
  mMap[day.monthKey].days.push(day);
});

// ── Design tokens ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "deus-todos-os-dias-v1";
const HEADER_BG   = "#F4D8B4";
const BODY_BG     = "#F9FAFB";
const CARD_DONE   = "#F4EEE7";
const TITLE_CLR   = "#492F1A";
const TAB_INACT   = "#BF9463";
const TAB_LINE    = "#FA6C24";
const ORANGE      = "#FA6C24";
const BROWN       = "#3D2B1F";
const GOLD        = "#BF9463";
const CAL         = "🗓️";
const calSans     = "'Cal Sans','Inter',sans-serif";
const inter       = "'Inter',sans-serif";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip HTML tags and decode entities for PDF text */
function htmlToPlainText(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/ol>|<\/ul>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Generate PDF for all days in a month that have notes */
function generateMonthPDF(month, progress) {
  const daysWithNotes = month.days.filter(day => {
    const d = progress[day.index] || {};
    return d.note || d.word || d.verse;
  });

  if (daysWithNotes.length === 0) {
    alert("Nenhuma anotação encontrada para este mês.");
    return;
  }

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  const addPageIfNeeded = (needed = 10) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Cover / title ──
  doc.setFillColor(244, 216, 180);
  doc.rect(0, 0, pageW, 50, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(73, 47, 26);
  doc.text("Deus Todos os Dias", pageW / 2, 22, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(73, 47, 26);
  doc.text(`Anotações — ${month.label}`, pageW / 2, 32, { align: "center" });

  doc.setDrawColor(250, 108, 36);
  doc.setLineWidth(0.6);
  doc.line(margin, 42, pageW - margin, 42);

  y = 58;

  // ── Days ──
  daysWithNotes.forEach((day, idx) => {
    const d = progress[day.index] || {};
    const noteText  = htmlToPlainText(d.note  || "");
    const wordText  = (d.word  || "").trim();
    const verseText = (d.verse || "").trim();

    // Estimate block height to decide on page break
    const noteLines  = noteText  ? doc.splitTextToSize(noteText, contentW).length  : 0;
    const wordLines  = wordText  ? doc.splitTextToSize(wordText, contentW).length  : 0;
    const verseLines = verseText ? doc.splitTextToSize(verseText, contentW).length : 0;
    const blockH = 14 + (noteText  ? 6 + noteLines  * 5.5 : 0)
                       + (wordText  ? 6 + wordLines  * 5.5 : 0)
                       + (verseText ? 6 + verseLines * 5.5 : 0) + 8;

    addPageIfNeeded(Math.min(blockH, 60));

    // Day header bar
    doc.setFillColor(244, 238, 231);
    doc.roundedRect(margin, y, contentW, 12, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(73, 47, 26);
    doc.text(`Dia ${day.dayNum}  —  ${day.reading.toUpperCase()}`, margin + 4, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(191, 148, 99);
    doc.text(day.dateLabel, pageW - margin - 4, y + 8, { align: "right" });

    y += 16;

    // Notes
    if (noteText) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(73, 47, 26);
      doc.text("Anotações da leitura", margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const noteWrapped = doc.splitTextToSize(noteText, contentW);
      noteWrapped.forEach(line => {
        addPageIfNeeded(6);
        doc.text(line, margin, y);
        y += 5.5;
      });
      y += 3;
    }

    // Word / summary
    if (wordText) {
      addPageIfNeeded(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(73, 47, 26);
      doc.text("Resumo em uma frase", margin, y);
      y += 5;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(80, 60, 40);
      const wordWrapped = doc.splitTextToSize(wordText, contentW);
      wordWrapped.forEach(line => {
        addPageIfNeeded(6);
        doc.text(line, margin, y);
        y += 5.5;
      });
      y += 3;
    }

    // Verse
    if (verseText) {
      addPageIfNeeded(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(73, 47, 26);
      doc.text("Passagem favorita", margin, y);
      y += 5;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(80, 60, 40);
      const verseWrapped = doc.splitTextToSize(verseText, contentW);
      verseWrapped.forEach(line => {
        addPageIfNeeded(6);
        doc.text(line, margin, y);
        y += 5.5;
      });
      y += 3;
    }

    // Separator between days
    if (idx < daysWithNotes.length - 1) {
      addPageIfNeeded(8);
      doc.setDrawColor(220, 210, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 6;
    }
  });

  // Page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(191, 148, 99);
    doc.text(`${i} / ${pageCount}`, pageW / 2, pageH - 8, { align: "center" });
  }

  const filename = `deus-todos-os-dias-${month.label.replace(" ", "-").toLowerCase()}.pdf`;
  doc.save(filename);
}

// ── Global CSS ────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cal+Sans&family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html, body { background:${BODY_BG}; overflow-x:hidden; width:100%; -webkit-text-size-adjust:100%; text-size-adjust:100%; }
  #root { overflow-x:hidden; width:100%; max-width:100vw; }
  ::-webkit-scrollbar { display:none; }
  * { scrollbar-width:none; }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes openAccordion { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

  /* Rich text editor */
  .rte-toolbar { display:flex; gap:4px; padding:7px 10px; background:#F9F5EF; border:1px solid #E2D9C8; border-bottom:none; border-radius:10px 10px 0 0; }
  .rte-btn { min-width:28px; height:28px; padding:0 6px; border:1px solid #E2D9C8; border-radius:6px; background:#fff; cursor:pointer; font-size:13px; color:${TITLE_CLR}; display:flex; align-items:center; justify-content:center; transition:background .12s; }
  .rte-btn:hover { background:#F4EEE7; }
  .rte-btn.active { background:${CARD_DONE}; border-color:${GOLD}; }
  .rte-editor {
    min-height:130px; padding:12px 14px;
    border:1px solid #E2D9C8; border-radius:0 0 10px 10px;
    outline:none; font-family:${inter}; font-size:16px; color:#1A1A1A;
    line-height:1.6; background:#fff; transition:border-color .2s;
  }
  .rte-editor:focus { border-color:${ORANGE}; }
  .rte-editor:empty:before { content:attr(data-placeholder); color:#C4A882; font-style:italic; pointer-events:none; }
  .rte-editor ul, .rte-editor ol { padding-left:20px; }
  .rte-editor li { margin:2px 0; }

  .plain-field {
    width:100%; padding:12px 14px;
    border:1px solid #E2D9C8; border-radius:10px;
    font-family:${inter}; font-size:16px; color:#1A1A1A;
    outline:none; background:#fff; transition:border-color .2s; line-height:1.6;
  }
  .plain-field:focus { border-color:${ORANGE}; }
  .plain-field::placeholder { color:#C4A882; font-style:italic; }

  .accordion-body { animation: openAccordion .2s ease; }
`;

// ── Rich text editor component ────────────────────────────────────────────────
function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const skipSync  = useRef(false);

  // Populate on mount / when day changes
  useEffect(() => {
    if (editorRef.current) {
      skipSync.current = true;
      editorRef.current.innerHTML = value || "";
      skipSync.current = false;
    }
  }, [value]);

  function exec(cmd, val = null) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  function onInput() {
    if (!skipSync.current && editorRef.current) onChange(editorRef.current.innerHTML);
  }

  const BtnIcon = ({ cmd, title, children }) => (
    <button
      className="rte-btn"
      title={title}
      onMouseDown={e => { e.preventDefault(); exec(cmd); }}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="rte-toolbar">
        <BtnIcon cmd="bold"   title="Negrito"><b>B</b></BtnIcon>
        <BtnIcon cmd="italic" title="Itálico"><i>I</i></BtnIcon>
        <div style={{ width:1, background:"#E2D9C8", margin:"0 4px" }} />
        <BtnIcon cmd="insertUnorderedList" title="Lista com marcadores">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="2" cy="3.5" r="1.2" fill="currentColor"/><rect x="5" y="2.8" width="8" height="1.4" rx=".7" fill="currentColor"/><circle cx="2" cy="7" r="1.2" fill="currentColor"/><rect x="5" y="6.3" width="8" height="1.4" rx=".7" fill="currentColor"/><circle cx="2" cy="10.5" r="1.2" fill="currentColor"/><rect x="5" y="9.8" width="8" height="1.4" rx=".7" fill="currentColor"/></svg>
        </BtnIcon>
        <BtnIcon cmd="insertOrderedList" title="Lista numerada">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><text x="0" y="5" fontSize="5" fill="currentColor" fontFamily="monospace">1.</text><rect x="5" y="2.8" width="8" height="1.4" rx=".7" fill="currentColor"/><text x="0" y="9.5" fontSize="5" fill="currentColor" fontFamily="monospace">2.</text><rect x="5" y="7.3" width="8" height="1.4" rx=".7" fill="currentColor"/></svg>
        </BtnIcon>
      </div>
      <div
        ref={editorRef}
        className="rte-editor"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Escreva suas reflexões e insights sobre a leitura..."
        onInput={onInput}
      />
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
function ProgressBar({ pct }) {
  return (
    <div style={{ height:6, background:"rgba(0,0,0,0.09)", borderRadius:99, overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, height:"100%", borderRadius:99, background:`linear-gradient(90deg,#C03A10,${ORANGE})`, transition:"width .4s ease", minWidth: pct > 0 ? 14 : 0 }} />
    </div>
  );
}

// ── Book intro accordion ───────────────────────────────────────────────────────
function BookIntro({ book }) {
  const [open, setOpen] = useState(false);
  const intro = BOOK_INTROS[book];
  if (!intro) return null;
  return (
    <div style={{ marginBottom:10, borderRadius:12, border:`1px solid rgba(191,148,99,0.3)`, overflow:"hidden", background:"#FFFBF6" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:"100%", padding:"13px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer", fontFamily:calSans, fontSize:13, color:TITLE_CLR, textAlign:"left", gap:8 }}>
        <span style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:15 }}>📖</span>
          <span>Introdução a {book}</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0, transition:"transform .2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M2 4.5l5 5 5-5" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="accordion-body" style={{ padding:"0 16px 16px", borderTop:`1px solid rgba(191,148,99,0.2)`, fontSize:13, lineHeight:1.75, color:"#444", fontFamily:inter }}>
          <p style={{ marginTop:12 }}>{intro}</p>
        </div>
      )}
    </div>
  );
}

function buildItems(days) {
  const items = [];
  let lastBook = null;
  days.forEach(day => {
    if (day.book !== lastBook) {
      items.push({ type:"intro", book:day.book, key:`intro-${day.book}-${day.index}` });
      lastBook = day.book;
    }
    items.push({ type:"day", day, key:`day-${day.index}` });
  });
  return items;
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [progress, setProgress] = useState({});
  const [loaded,   setLoaded]   = useState(false);
  const [activeM,  setActiveM]  = useState(0);
  const [selDay,   setSelDay]   = useState(null);
  // note is now HTML string; word and verse remain plain text
  const [note,  setNote]  = useState("");
  const [word,  setWord]  = useState("");
  const [verse, setVerse] = useState("");
  const tabsRef = useRef(null);

  const today = new Date(); today.setHours(0,0,0,0);
  const todayIdx = Math.floor((today.getTime() - START.getTime()) / 86400000);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProgress(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  function saveP(p) {
    setProgress(p);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
  }

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

  function openDay(day) {
    const d = progress[day.index] || {};
    setNote(d.note || "");
    setWord(d.word || "");
    setVerse(d.verse || "");
    setSelDay(day);
  }

  function saveNotes() {
    saveP({ ...progress, [selDay.index]: { ...(progress[selDay.index]||{}), note, word, verse } });
    setSelDay(null);
  }

  const totalDone  = Object.values(progress).filter(d => d.completed).length;
  const overallPct = Math.round((totalDone / 365) * 100);
  const month      = MONTHS[activeM];
  const mDone      = month ? month.days.filter(d => progress[d.index]?.completed).length : 0;
  const mPct       = month ? Math.round((mDone / month.days.length) * 100) : 0;

  if (!loaded) return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:BODY_BG, fontFamily:inter, color:ORANGE }}>
      Carregando...
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:BODY_BG, fontFamily:inter, color:"#1A1A1A", fontSize:14 }}>

        {/* ── HEADER + TABS — single sticky block, no gap ── */}
        <div style={{ position:"sticky", top:0, zIndex:100 }}>
          {/* Header */}
          <div style={{ background:HEADER_BG, padding:"18px 18px 16px" }}>
            <div style={{ fontFamily:calSans, fontWeight:600, fontSize:22, textAlign:"center", color:TITLE_CLR, marginBottom:14 }}>
              ✦ Deus todos os dias ✦
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:13, color:TITLE_CLR }}>{totalDone} de 365 dias</span>
              <span style={{ fontSize:13, color:TITLE_CLR }}>{overallPct}%</span>
            </div>
            <ProgressBar pct={overallPct} />
          </div>

          {/* Month tabs — directly below, no gap */}
          <div ref={tabsRef} style={{ overflowX:"auto", display:"flex", background:"#FFFFFF", borderBottom:"1px solid rgba(0,0,0,0.07)", padding:"0 4px" }}>
            {MONTHS.map((m, i) => {
              const active = i === activeM;
              return (
                <button key={m.key} data-active={active} onClick={() => setActiveM(i)} style={{ flexShrink:0, padding:"12px 14px 10px", background:"none", border:"none", borderBottom: active ? `2px solid ${TAB_LINE}` : "2px solid transparent", color: active ? TITLE_CLR : TAB_INACT, fontFamily:calSans, fontWeight: active ? 700 : 400, fontSize:12, cursor:"pointer", whiteSpace:"nowrap", letterSpacing:".04em", transition:"color .15s", marginBottom:-1 }}>
                  {m.short}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MONTH CONTENT ── */}
        {month && (
          <div style={{ padding:"0 14px 80px", background:BODY_BG }}>

            {/* Month heading + PDF button */}
            <div style={{ padding:"16px 2px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ fontFamily:calSans, fontWeight:600, fontSize:22, color:"#1A1A1A" }}>
                  {month.label}
                </div>
                {/* PDF download button */}
                <button
                  onClick={() => generateMonthPDF(month, progress)}
                  title="Baixar anotações do mês em PDF"
                  style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", background:"#fff", border:`1px solid rgba(191,148,99,0.4)`, borderRadius:99, fontFamily:calSans, fontSize:12, color:TITLE_CLR, cursor:"pointer", flexShrink:0, transition:"background .15s" }}
                  onMouseOver={e => e.currentTarget.style.background = CARD_DONE}
                  onMouseOut={e => e.currentTarget.style.background = "#fff"}
                >
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

            {/* Day list */}
            {buildItems(month.days).map(item => {
              if (item.type === "intro") return <BookIntro key={item.key} book={item.book} />;

              const { day } = item;
              const d          = progress[day.index] || {};
              const done       = !!d.completed;
              const isToday    = day.index === todayIdx;
              const isTomorrow = day.index === todayIdx + 1;
              const hasNotes   = !!(d.note || d.word || d.verse);

              return (
                <div key={item.key} onClick={() => openDay(day)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background: done ? CARD_DONE : "#FFFFFF", borderRadius:14, marginBottom:8, cursor:"pointer", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", outline: isToday ? `2px solid ${ORANGE}` : "none", transition:"background .15s" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0, width:34 }}>
                    <span style={{ fontSize:20, lineHeight:1 }}>{CAL}</span>
                    <span style={{ fontSize:10, color:"#999", fontWeight:500 }}>{day.dateLabel}</span>
                  </div>
                  <div onClick={e => { e.stopPropagation(); toggleDay(day.index); }} style={{ width:22, height:22, borderRadius:"50%", flexShrink:0, cursor:"pointer", border: done ? "none" : "1.5px solid #C8C0B4", background: done ? "#4CAF50" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
                    {done && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3, flexWrap:"wrap" }}>
                      <span style={{ fontSize:13, fontWeight:600, color: done ? "#AAA" : "#1A1A1A" }}>Dia {day.dayNum}</span>
                      {isToday    && <span style={{ fontSize:10, fontWeight:700, background:"#FDEDED", color:ORANGE, padding:"2px 8px", borderRadius:99, lineHeight:1.5 }}>Hoje</span>}
                      {isTomorrow && !done && <span style={{ fontSize:10, fontWeight:700, background:"#FEF3EC", color:ORANGE, padding:"2px 8px", borderRadius:99, lineHeight:1.5 }}>Amanhã</span>}
                      {hasNotes && !isToday && !isTomorrow && <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:"#C4A882" }} />}
                    </div>
                    <div style={{ fontSize:13, color: done ? "#BBB" : "#555", textDecoration: done ? "line-through" : "none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{day.reading}</div>
                  </div>
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ flexShrink:0 }}><path d="M1 1l5 5-5 5" stroke="#C8C0B4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MODAL ── */}
        {selDay && (
          <div onClick={() => setSelDay(null)} style={{ position:"fixed", inset:0, background:"rgba(20,12,4,0.5)", zIndex:200, display:"flex", alignItems:"flex-end", animation:"fadeIn .2s ease" }}>
            <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxHeight:"92vh", background:"#FFFFFF", borderRadius:"20px 20px 0 0", overflowY:"auto", animation:"slideUp .28s cubic-bezier(.32,.72,0,1)" }}>

              <div style={{ width:36, height:4, background:"#E0D8C8", borderRadius:2, margin:"14px auto 0" }} />

              {/* Modal header */}
              <div style={{ padding:"16px 20px 14px", borderBottom:"1px solid #F0EAE0" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:GOLD }}>Dia {selDay.dayNum}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:16, lineHeight:1 }}>{CAL}</span>
                    <span style={{ fontSize:13, fontWeight:500, color:GOLD }}>{selDay.dateLabel}</span>
                  </div>
                </div>
                <div style={{ fontFamily:calSans, fontWeight:600, fontSize:20, color:"#1A1A1A", textTransform:"uppercase", letterSpacing:".04em" }}>
                  {selDay.reading}
                </div>
              </div>

              {/* Fields */}
              <div style={{ padding:"20px 20px 0" }}>

                {/* Rich text notes */}
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:"block", fontFamily:calSans, fontSize:13, fontWeight:600, color:"#1A1A1A", marginBottom:8 }}>
                    Anotações da leitura
                  </label>
                  <RichTextEditor key={selDay.index} value={note} onChange={setNote} />
                </div>

                {/* Resumo em uma frase (renamed from "Uma palavra") */}
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:"block", fontFamily:calSans, fontSize:13, fontWeight:600, color:"#1A1A1A", marginBottom:8 }}>
                    Resumo em uma frase
                  </label>
                  <input
                    className="plain-field"
                    type="text"
                    placeholder="Uma frase que resume essa leitura"
                    value={word}
                    onChange={e => setWord(e.target.value)}
                    style={{ display:"block" }}
                  />
                </div>

                {/* Passagem favorita */}
                <div style={{ marginBottom:20 }}>
                  <label style={{ display:"block", fontFamily:calSans, fontSize:13, fontWeight:600, color:"#1A1A1A", marginBottom:8 }}>
                    Passagem favorita
                  </label>
                  <input
                    className="plain-field"
                    type="text"
                    placeholder="Versículo que mais tocou o seu coração"
                    value={verse}
                    onChange={e => setVerse(e.target.value)}
                    style={{ display:"block" }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display:"flex", gap:12, padding:"4px 20px 36px" }}>
                <button onClick={() => setSelDay(null)} style={{ flex:1, padding:"14px", background:"#fff", border:"1.5px solid #DDD", borderRadius:50, fontFamily:calSans, fontWeight:500, fontSize:14, color:"#1A1A1A", cursor:"pointer" }}>
                  Cancelar
                </button>
                <button onClick={saveNotes} style={{ flex:1, padding:"14px", background:BROWN, border:"none", borderRadius:50, fontFamily:calSans, fontWeight:600, fontSize:14, color:"#fff", cursor:"pointer" }}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
