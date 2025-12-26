#!/usr/bin/env python3
"""
Script zum Umwandeln von "ue" zu "ü" in deutschen Texten.
Ignoriert englische Wörter, URLs und Quellen.
"""

import re
import os
from pathlib import Path

# Englische Wörter, die "ue" enthalten und NICHT geändert werden sollen
ENGLISH_WORDS_WITH_UE = {
    'value', 'values', 'true', 'blue', 'queue', 'queued', 'issue', 'issues',
    'tissue', 'pursue', 'pursued', 'rescue', 'rescue', 'argue', 'argued',
    'venue', 'revenue', 'continue', 'continued', 'statue', 'virtue', 'unique',
    'technique', 'antique', 'opaque', 'plaque', 'cheque', 'unique', 'pursue',
    'subdue', 'imbue', 'imbued', 'accrue', 'accrued', 'ensue', 'ensued',
    'sue', 'sued', 'glue', 'glued', 'clue', 'clued', 'due', 'hue', 'cue',
    'barbecue', 'avenue', 'residue', 'overdue', 'undue', 'endue', 'endued'
}

# Dateiendungen, die verarbeitet werden sollen
TARGET_EXTENSIONS = {'.md', '.ts', '.tsx', '.astro', '.json'}

# Verzeichnisse, die übersprungen werden sollen
SKIP_DIRS = {'node_modules', 'dist', '.git', '.next', 'tmp'}

def is_url_or_link(text, pos):
    """Prüft, ob die Position in einer URL oder einem Link liegt."""
    # Suche nach URLs (http://, https://, www., etc.)
    url_pattern = r'(https?://|www\.|doi\.org|pubmed\.ncbi\.nlm\.nih\.gov|\.com|\.de|\.org)'
    # Suche nach Markdown-Links [text](url)
    link_pattern = r'\[.*?\]\(.*?\)'
    
    # Prüfe Bereich vor und nach der Position
    context_start = max(0, pos - 100)
    context_end = min(len(text), pos + 100)
    context = text[context_start:context_end]
    
    if re.search(url_pattern, context, re.IGNORECASE):
        return True
    if re.search(link_pattern, context):
        return True
    
    return False

def is_english_word(word):
    """Prüft, ob ein Wort ein englisches Wort ist."""
    word_lower = word.lower()
    # Direkter Treffer in der Liste
    if word_lower in ENGLISH_WORDS_WITH_UE:
        return True
    
    # Prüfe, ob das Wort Teil eines englischen Wortes ist
    for eng_word in ENGLISH_WORDS_WITH_UE:
        if word_lower in eng_word or eng_word in word_lower:
            return True
    
    # Heuristik: Wenn das Wort nur aus lateinischen Buchstaben besteht
    # und typisch englische Muster hat, könnte es englisch sein
    # Aber wir sind hier konservativ und ändern nur, wenn wir sicher sind
    
    return False

def should_replace_ue(text, match_start, match_end):
    """Entscheidet, ob "ue" an dieser Stelle ersetzt werden soll."""
    # Prüfe, ob es in einem Code-Block ist (```...```)
    before = text[:match_start]
    after = text[match_end:]
    
    # Zähle Code-Block-Marker vor der Position
    code_blocks_before = before.count('```')
    # Wenn ungerade Anzahl, sind wir in einem Code-Block
    if code_blocks_before % 2 == 1:
        return False
    
    # Prüfe, ob es in einem Inline-Code-Block ist (`...`)
    # Suche nach dem letzten ` vor der Position
    last_backtick = before.rfind('`')
    if last_backtick != -1:
        # Prüfe, ob es ein schließendes ` gibt
        next_backtick = after.find('`')
        if next_backtick != -1:
            # Wir sind in einem Inline-Code-Block
            return False
    
    # Prüfe, ob es eine URL/Link ist
    if is_url_or_link(text, match_start):
        return False
    
    # Hole das vollständige Wort für englische Wortprüfung
    word_start = match_start
    word_end = match_end
    
    # Erweitere nach links, bis wir einen Wortanfang finden
    while word_start > 0 and (text[word_start - 1].isalnum() or text[word_start - 1] == '_'):
        word_start -= 1
    
    # Erweitere nach rechts, bis wir ein Wortende finden
    while word_end < len(text) and (text[word_end].isalnum() or text[word_end] == '_'):
        word_end += 1
    
    word = text[word_start:word_end]
    
    # Prüfe, ob es ein englisches Wort ist
    if is_english_word(word):
        return False
    
    # Standard: Ersetzen
    return True

def replace_ue_in_text(text):
    """Ersetzt "ue" durch "ü" in einem Text, wo es angemessen ist."""
    result = []
    last_pos = 0
    
    # Finde alle "ue" Vorkommen (auch innerhalb von Wörtern)
    for match in re.finditer(r'ue', text, re.IGNORECASE):
        match_start = match.start()
        match_end = match.end()
        
        # Prüfe, ob wir ersetzen sollen
        if should_replace_ue(text, match_start, match_end):
            # Füge Text vor dem Match hinzu
            result.append(text[last_pos:match_start])
            # Ersetze "ue" durch "ü" (behalte Groß-/Kleinschreibung)
            if text[match_start:match_start+1].isupper():
                result.append('Ü')
            else:
                result.append('ü')
            last_pos = match_end
        else:
            # Nicht ersetzen, Text beibehalten
            result.append(text[last_pos:match_end])
            last_pos = match_end
    
    # Füge restlichen Text hinzu
    result.append(text[last_pos:])
    
    return ''.join(result)

def process_file(file_path, dry_run=False):
    """Verarbeitet eine einzelne Datei."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Ersetze "ue" durch "ü"
        new_content = replace_ue_in_text(content)
        
        # Nur schreiben, wenn sich etwas geändert hat
        if new_content != content:
            if not dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
            return True
        return False
    except Exception as e:
        print(f"Fehler beim Verarbeiten von {file_path}: {e}")
        return False

def should_process_file(file_path):
    """Prüft, ob eine Datei verarbeitet werden soll."""
    # Prüfe Dateiendung
    if file_path.suffix not in TARGET_EXTENSIONS:
        return False
    
    # Prüfe, ob in einem zu überspringenden Verzeichnis
    parts = file_path.parts
    for skip_dir in SKIP_DIRS:
        if skip_dir in parts:
            return False
    
    return True

def main():
    """Hauptfunktion."""
    import sys
    
    # Prüfe auf --dry-run Flag
    dry_run = '--dry-run' in sys.argv
    
    # Startverzeichnis ist das Projekt-Root
    project_root = Path(__file__).parent.parent
    
    files_processed = 0
    files_changed = 0
    
    if dry_run:
        print("DRY-RUN Modus: Es werden keine Dateien geändert.\n")
    
    # Durchsuche alle Dateien
    for file_path in project_root.rglob('*'):
        if file_path.is_file() and should_process_file(file_path):
            files_processed += 1
            if process_file(file_path, dry_run=dry_run):
                files_changed += 1
                status = "Würde ändern" if dry_run else "Geändert"
                print(f"{status}: {file_path.relative_to(project_root)}")
    
    if dry_run:
        print(f"\nDRY-RUN: {files_changed} von {files_processed} Dateien würden geändert werden.")
        print("Führe das Script ohne --dry-run aus, um die Änderungen anzuwenden.")
    else:
        print(f"\nFertig! {files_changed} von {files_processed} Dateien wurden geändert.")

if __name__ == '__main__':
    main()

