import os

#! Execute once to withdraw all scripts and events needed for matomo tracking - disables matomo tracking
#! To activate matomo tracking execute insert-scripts.py

#####################################################
# part 1: Paths for .html files in root dir.
#####################################################

root_tracking_script = '<script src="_assets/js/tracking.js"></script>'
root_confirm_script  = '<script src="_assets/js/confirmConsent.js"></script>'
root_withdraw_script = '<script src="_assets/js/withdrawConsent.js"></script>'
root_insertion       = root_confirm_script + "\n" + root_withdraw_script + "\n" + root_tracking_script + "\n"

# search for .html files in root dir
for file in os.listdir("."):
    if file.lower().endswith(".html") and os.path.isfile(file):
        try:
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
            if root_insertion in content:
                # remove insertions-block if its there
                new_content = content.replace(root_insertion, "")
                with open(file, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Scripts removed from (root): {file}")
            else:
                print(f"No </body> tag found in (root): {file}")
        except Exception as e:
            print(f"Error editing {file}: {e}")

#####################################################
# part 2: os.walk through dirs and insert scripts
#####################################################

sub_tracking_script = '<script src="../_assets/js/tracking.js"></script>'
sub_confirm_script  = '<script src="../_assets/js/confirmConsent.js"></script>'
sub_withdraw_script = '<script src="../_assets/js/withdrawConsent.js"></script>'
sub_insertion       = sub_confirm_script + "\n" + sub_withdraw_script + "\n" + sub_tracking_script + "\n"

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
                if sub_insertion in content:
                    # remove insertions-block if its there
                    new_content = content.replace(sub_insertion, "")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Scripts removed from (sub): {file_path}")
                else:
                    print(f"No </body> tag found in: {file_path}")
            except Exception as e:
                print(f"Error editing {file_path}: {e}")
