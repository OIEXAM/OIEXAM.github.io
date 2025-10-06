from flask import Flask, render_template, jsonify, request
import pandas as pd
import numpy as np
import pdfplumber
import json
import re
import os
from pathlib import Path


def clean_table(table):
    merged_table = merged_rows(table)
    cleaned_table = []
    for row in merged_table:
        cleaned_row = []
        for cell in row:
            if cell:
                cleaned_row.append(cell.replace("\n", " "))
            else:
                cleaned_row.append(None)
        cleaned_table.append(cleaned_row)
    return cleaned_table


def row_contains_rollno(row):
    matched_row = None
    new_row = row.copy()
    for num, cell in enumerate(row):
        if cell:
            text = str(cell).strip()
            text = re.sub(r"\s+", " ", text)
            #             print(text)
            match = re.match(
                r"^(\d{7,})(?:\s+(.+))?$", text
            )  # re.match(r"^\d{7,}\b", text)
            if match:
                # print("into the match condition",match)
                matched_row = match
                rollno, name_parent = match.groups()
                if name_parent:
                    word_count = len(name_parent.split())
                    if word_count >= 2:
                        new_row[num] = rollno.strip()
                        new_row[num + 1] = name_parent.strip()
                else:
                    new_row[num] = cell
            else:
                new_row[num] = row[num]
    # print("Yes",matched_row,"\n",new_row)
    return matched_row, new_row


def merged_rows(table):
    merged_table = []
    i = 0
    while i < len(table):
        match, current_row = row_contains_rollno(table[i])
        if bool(match):  # check if row has roll no
            merged_row = current_row.copy()
            merg_count = 0
            for k in range(
                1, 3
            ):  # check if next row has roll no or not if not merge next row
                if i + k < len(table):
                    match_1, next_row = row_contains_rollno(table[i + k])
                    if not bool(match_1):
                        #                 print("no")
                        for j in range(len(current_row)):
                            if next_row[j]:  #!= None or next_row[j]!=""):
                                merged_row[j] = next_row[j]
                        # print("no")
                        merg_count += 1
                    else:
                        break
                else:
                    break
            merged_table.append(merged_row)
            i += 1 + merg_count
        else:
            merged_table.append(current_row)
            #         print("Hello", i)
            i += 1
    return merged_table


def read_pdf(path_to_pdf):
    pdf = pdfplumber.open(path_to_pdf)
    print(pdf)
    all_tables = []
    print(pdf.pages)
    for page_num, page in enumerate(pdf.pages):
        tb = page.extract_table({"text_line_dir": "btt"})
        if tb:
            cleaned_table = clean_table(tb)
            df = pd.DataFrame(cleaned_table)
            all_tables.append(df)
    return all_tables


def write_files(table, filename):
    print(filename)
    combined_df = pd.concat(table, ignore_index=True)
    print(combined_df.head())
    combined_df.to_csv(f"{filename}.csv", index=False, header=False)


def get_folder(This_folder):
    # This_folder = os.walk("./")
    Input_path = []
    for f in This_folder.iterdir():
        Input_path.append(f)
    return Input_path


def read_files_path(This_folder):
    Input_path = get_folder(This_folder)
    print(len(Input_path), "yes")
    for path in Input_path:
        Files = path.rglob('*pdf')
        if Files:
            Out_Path = [];
            for file in Files:
                print(pdfplumber.open(file))
                print(file)
                print(file.parts)
                # table = read_pdf(path)
                Outpath = Path("./Results") / file.parts[1]
                Outpath.mkdir(parents=True, exist_ok=True)
                Output_filename = Outpath / f"{file.stem}.csv"
                Out_Path.append(str(Output_filename))
                print(Outpath)
                print(Out_Path)
            json_path = Outpath / "index.json"
            print(json_path)
            # # for input in Input_path:
            with open(json_path, "w") as f:
                json.dump({"Files": Out_Path}, f, indent=2)

This_folder = Path("./Files")
read_files_path(This_folder)
print(This_folder)
# read_files_path(get_folder(This_folder))
# @app.route("/")
# def home():
#     return render_template("index.html")


# @app.route("/data_recieve", methods=["GET", "POST"])
# def data_recieve():
#     data = combined_df.to_json(orient='index')
#     return data

# if __name__=="__main__":
#     app.run(debug=True)
