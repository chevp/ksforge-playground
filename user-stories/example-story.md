# Als Nutzer möchte ich einen neuen POC per User-Story anlegen können

## Beschreibung

Ich möchte in ksforge-playground eine User-Story als Markdown ablegen, damit daraus
automatisch ein neuer `poc-NN-<stack>`-Ordner mit lauffähigem Grundgerüst entsteht.

## Akzeptanzkriterien

- Die Markdown-Datei unter `user-stories/` wird zu JSON unter `user-stories/json/` konvertiert
- Die Story-ID zählt fortlaufend über `.ksforge-playground/story-counter.txt`
- ksforge verarbeitet die generierte JSON-Story
