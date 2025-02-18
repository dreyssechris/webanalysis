import os

#! Execute once to insert all scripts and events needed for matomo tracking - enables matomo tracking
#! To remove matomo tracking execute withdraw-scripts.py

#####################################################
# part 1: Paths for .html files in root dir.
#####################################################

root_tracking_script = '<script src="_assets/js/tracking.js"></script>'
root_confirm_script  = '<script src="_assets/js/confirmConsent.js"></script>'
root_withdraw_script = '<script src="_assets/js/withdrawConsent.js"></script>'
root_insertion       = root_confirm_script + "\n" + root_tracking_script + "\n"

toggle_button_snippet = '<p><br> <button id="toggleConsent"></button> </p>'

# search for .html files in root dir
for file in os.listdir("."):
    if file.lower().endswith(".html") and os.path.isfile(file):
        try:
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
            
            if "</body>" in content:
                # insert withdraw-script into datenschutz-page if its not existing yet
                if file.lower() == "datenschutz.html":
                    # insert the tracking consent button if not already there
                    marker = '<div class="joText-wrapper">'
                    if marker in content and toggle_button_snippet not in content:
                        content = content.replace(marker, marker + "\n" + toggle_button_snippet, 1)
                        print(f"Toggle button inserted in datenschutz.html: {file}")
                    else:
                        print(f"Toggle button already present or marker not found in datenschutz.html: {file}")

                    if root_withdraw_script in content:
                        print(f"Withdraw script already inserted in datenschutz.html: {file}")
                    else:
                        new_content = content.replace("</body>", root_withdraw_script + "\n" + root_insertion + "</body>")
                        with open(file, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"Withdraw script inserted into datenschutz.html: {file}")
                    continue  # Verarbeitung dieser Datei abgeschlossen.
                
                # for all other files check if confirm and tracking tags are existing
                if root_tracking_script in content or root_confirm_script in content:
                    print(f"Scripts already inserted in (root): {file}")
                else:
                    new_content = content.replace("</body>", root_insertion + "</body>")
                    with open(file, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Scripts inserted into (root): {file}")
            else:
                print(f"No </body> tag found in (root): {file}")
        except Exception as e:
            print(f"Error editing {file}: {e}")


#####################################################
# part 2: os.walk through dirs and insert scripts
#####################################################

sub_tracking_script = '<script src="../_assets/js/tracking.js"></script>'
sub_confirm_script  = '<script src="../_assets/js/confirmConsent.js"></script>'
sub_insertion       = sub_confirm_script + "\n" + sub_tracking_script + "\n"

toggleConsent_button = '<p><br> <button id="toggleConsent"></button> </p>'

# repeat insertion for subfolders of root
for dirpath, dirnames, filenames in os.walk("."):
    # skip root dir cause links are different
    if os.path.abspath(dirpath) == os.path.abspath("."):
        continue 
    for file in filenames:
        if file.lower().endswith(".html"):
            file_path = os.path.join(dirpath, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                if "</body>" in content:
                    # check if one tag is existing
                    if (sub_tracking_script in content or 
                        sub_confirm_script  in content):
                        print(f"Scripts already inserted in (sub): {file_path}")
                    else:
                        # insert before "</body>"
                        new_content = content.replace("</body>", sub_insertion + "</body>")
                        with open(file_path, "w", encoding="utf-8") as f:
                            f.write(new_content)
                        print(f"Scripts inserted into (sub): {file_path}")
                else:
                    print(f"No </body> tag found in: {file_path}")
            except Exception as e:
                print(f"Error editing {file_path}: {e}")

#############################################################
# part 3: create `_assets/js` and insert scripts if missing
#############################################################

target_folder = os.path.join("_assets", "js")

if not os.path.isdir(target_folder): 
    os.makedirs(target_folder)
    print(f"Successfully created folder: {target_folder}")
else: 
    print(f"Folder already exists: {target_folder}")

# create those files if not existing
files_to_create = {
    "confirmConsent.js": "// confirmConsent.js - Standardinhalt\n",
    "tracking.js": "// tracking.js - Standardinhalt\n",
    "withdrawConsent.js": "// withdrawConsent.js - Standardinhalt\n"
}

# for each file check if exists - if not it will be created
for filename, default_content in files_to_create.items(): 
    file_path = os.path.join(target_folder, filename)
    if not os.path.exists(file_path): 
        with open(file_path, "w", encoding="utf-8") as f: 
            f.write(default_content)
        print(f"Created Script: {file_path}")
    else: 
        print(f"File already exists: {file_path}")