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
                match = re.match(r"^(\d{5,})\s+(.+)$", cell.strip())
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


This_folder = os.walk("./")
print(This_folder)
Input_path = []
Output_path = []
for dirpath, dirname, filenames in This_folder:
    print(dirpath, "\n", dirname, "\n", filenames)
    # print(filenames)
    if dirpath == "./Files":
        print(dirpath, filenames)
        for dir in dirname:
            Input_path.append(os.path.join(dirpath, dir))

print(Input_path)
# print(Output_path)
counter = 0
for path in Input_path:
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
                Output_path = (
                    path_to_pdf.split("/")[0] + "/Results/" + path_to_pdf.split("/")[2]
                )
                os.makedirs(Output_path, exist_ok=True)
                # print((path_to_pdf.split("/")[3]).split("."))
                Output_filename = (
                    Output_path + "/" + (path_to_pdf.split("/")[3]).split(".")[0]
                )
                write_files(table, Output_filename)
        break
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
#     print(os.listdir(input))
# filename = os.path.join(THIS_FOLDER, path_to_pdf)
# file = This_folder[5]
# path_to_pdf = "./Files/" + file
# pdf = pdfplumber.open(path_to_pdf)
# all_tables = []
# print(path_to_pdf)


# print(tables)
# rows = []
# print("TABLE")
# for table in tables:
#     print(table)
#     for row in table:
#         rows.append(row)
#         # print(row)
#     break;
#     print("\\n")


# @app.route("/")
# def home():
#     return render_template("index.html")


# @app.route("/data_recieve", methods=["GET", "POST"])
# def data_recieve():
#     data = combined_df.to_json(orient='index')
#     return data

# if __name__=="__main__":
#     app.run(debug=True)
