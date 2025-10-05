from flask import Flask, render_template, jsonify, request
import pandas as pd
import numpy as np
import pdfplumber
import json
import re
import os


def clean_table(table):
    cleaned_table = []
    for row in table:
        cleaned_row = []
        for cell in row:
            if cell:
                cleaned_row.append(cell.replace("\n", " "))
            else:
                cleaned_row.append(None)
        cleaned_table.append(cleaned_row)
    return split_rollno(cleaned_table)


def split_rollno(table):
    split_table = []
    for row in table:
        skip = -1
        new_row = []
        for num, cell in enumerate(row):
            if cell:
                text = str(cell).strip()
                text = re.sub(r"\s+", " ", text)
                match = re.match(r"^(\d{5,})\s+(.+)$", text)
                if match:
                    # print(match.groups())
                    rollno, name_parent = match.groups()
                    word_count = len(name_parent.split())
                    if word_count >= 2:
                        skip = num + 1
                        new_row.append(rollno.strip())
                        new_row.append(name_parent.strip())
                else:
                    new_row.append(cell)
            elif skip == num:
                continue
            else:
                new_row.append(None)
        split_table.append(new_row)
    return split_table


def row_contains_rollno(row):
    match = "";
    for num, cell in enumerate(row):
        if cell:
            text = str(cell).strip()
            #             print(text, "text")
            text = re.sub(r"\s+", " ", text)
            match = re.match(r"^(\d{5,})\s+(.+)$", text)
            if match:
                return match
    return match


def merge_rows(table):
    merged_table = []
    i = 0
    while i < len(table):
        current_row = table[i]  # get current row
        if bool(row_contains_rollno(current_row)):  # check if row has roll no
            merged_row = current_row.copy()
            merg_count = 0
            for k in range(
                1, 3
            ):  # check if next row has roll no or not if not merge next row
                if i + k < len(table):
                    next_row = table[i + k]
                    if not bool(row_contains_rollno(next_row)):
                        #                 print("no")
                        for j in range(len(current_row)):
                            if next_row[j]:  #!= None or next_row[j]!=""):
                                merged_row[j] = next_row[j]
                        print("no")
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
            merge_table = merge_rows(tb)
            cleaned_table = clean_table(merge_table)
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
    print(This_folder)
    Input_path = []
    for dirpath, dirname, filenames in This_folder:
        # print(dirpath, "\n", dirname, "\n", filenames)
        # print(filenames)
        if dirpath == "./Files":
            print(dirpath, filenames)
            for dir in dirname:
                Input_path.append(os.path.join(dirpath, dir))
    print(Input_path)
    return Input_path


def read_files_path(Input_path):
    print(Input_path[-1], "yes")
    counter = 0
    for path in Input_path:
        path = Input_path[-1]
        files = os.listdir(path)
        counter = counter + 1
        print(files)
        print(counter)
        if files:
            Output_path = []
            for file in files:
                if file.endswith(".pdf"):
                    path_to_pdf = os.path.join(path, file)
                    print(path_to_pdf, "jo")
                    table = read_pdf(path_to_pdf)
                    Out_path = (
                        path_to_pdf.split("/")[0]
                        + "/Results/"
                        + path_to_pdf.split("/")[2]
                    )
                    os.makedirs(Out_path, exist_ok=True)
                    # print((path_to_pdf.split("/")[3]).split("."))
                    Output_filename = (
                        Out_path + "/" + (path_to_pdf.split("/")[3]).split(".")[0]
                    )
                    write_files(table, Output_filename)
                    Output_path.append(f"{Output_filename}.csv")
            json_file = (
                path_to_pdf.split("/")[0]
                + "/Results/"
                + path_to_pdf.split("/")[2]
                + "/"
                + "index.json"
            )
            print(json_file)
            # for input in Input_path:
            with open(json_file, "w") as f:
                json.dump({"Files": Output_path}, f, indent=2)


This_folder = os.walk("./")
read_files_path(get_folder(This_folder))
# @app.route("/")
# def home():
#     return render_template("index.html")


# @app.route("/data_recieve", methods=["GET", "POST"])
# def data_recieve():
#     data = combined_df.to_json(orient='index')
#     return data

# if __name__=="__main__":
#     app.run(debug=True)
