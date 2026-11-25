# Vamos aprender!

Aplicação de cartões de leitura em português europeu, preparada para GitHub Pages.

## Organização do CSV

Edite `data/words.csv`. A primeira linha deve ser:

`category,group,word,image,sound,question`

- `category`: matéria principal: `Ditongos`, `Palavras` ou `Frases` (pode criar outras).
- `group`: grupo dentro da matéria, por exemplo `ão`, `Simples`, `Maiores` ou `Curtas`.
- `word`: palavra ou frase completa que será a resposta e será lida em voz alta.
- `image`: nome do ficheiro em `images/`. Pode ficar vazio; nesse caso o cartão mostra apenas o texto.
- `sound`: nome do MP3 em `audio/`. Pode ficar vazio; nesse caso o navegador tenta ler o texto com uma voz pt-PT.
- `question`: texto com `_` nas posições que a criança deve completar. Cada `_` é preenchido pela próxima letra escolhida.

Use aspas em campos que contenham vírgulas. Para frases, mantenha espaços e pontuação no campo `word` e em `question`.

O programa ainda aceita o formato antigo `DT,word,image,sound,question`: essas linhas são automaticamente apresentadas na matéria `Ditongos`, com o ditongo como grupo.

## Imagens e áudio

Coloque as imagens em `images/` e indique o nome exato no CSV. Formatos comuns como JPG, PNG e SVG funcionam. Um campo `image` vazio é válido e não provoca imagem quebrada.

Para gerar os MP3 no Mac com a voz Joana:

1. Instale o FFmpeg uma vez: `brew install ffmpeg`
2. No Terminal, entre na pasta do projeto.
3. Execute: `python3 generate_ditongos_audio.py`
4. Para substituir ficheiros MP3 existentes: `python3 generate_ditongos_audio.py --overwrite`

O script lê as colunas `word` e `sound` pelo nome, pelo que funciona com o novo CSV e com o antigo.

## Publicar

Envie o conteúdo desta pasta para o repositório GitHub Pages, mantendo as pastas `data`, `images`, `audio`, `css` e `js`.
