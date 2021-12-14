#!/user/bin/env python3
#import asyncio
import json
from os import path, remove
import requests
import sqlite3

class ArachneTable(object):
    def __init__(self, tblName, url, token):
        self.p = path.dirname(path.abspath(__file__))
        self.tblName = tblName
        self.__token = token
        self.__url = url
        self.__update()

    ### SQLITE CONNCETION
    def __command(self, sql, values = None):
        re = True
        db = sqlite3.connect(self.p+"/arachne.db")
        def dict_factory(cursor, row):
            d = {}
            for idx, col in enumerate(cursor.description):
                d[col[0]] = row[idx]
            return d
        db.row_factory = dict_factory
        cursor = db.cursor()
        if type(sql) == str:
            if values == None: cursor.execute(sql)
            else: cursor.execute(sql, values)
            re = cursor.fetchall()
        else:
            for s in sql:
                cursor.execute(s["sql"], s["vals"])
        db.commit()
        db.close()
        return re

    ### SERVER CONNECTION
    def __call(self, location, method= "GET", data=None):
        '''calls server and handles authorization and transfer of data.'''
        headers = {"Authorization": f"Bearer {self.__token}"}
        if method == "GET":
            return requests.get(self.__url+location, headers=headers)
        if method == "POST":
            return requests.post(self.__url+location, headers=headers, json=data)
        if method == "PATCH":
            return requests.patch(self.__url+location, headers=headers, json=data)
        if method == "DELETE":
            return requests.delete(self.__url+location, headers=headers)
        else:
            raise Exception(f"UNKNOWN METHOD '{method}' WITH CALL().")

    def __getAll(self, u_date=None):
        '''
            returns all rows of table.
            if u_date is given, only newer rows are downloaded.
        '''
        url = "/data/"+self.tblName
        if u_date != None: url += f"?u_date={u_date}"
        re = self.__call(url)
        return re.json()

    def __update(self):
        #print("start updating...", self.tblName)
        initial_setup = False
        if len(self.__command(f"SELECT name FROM sqlite_master WHERE name = '{self.tblName}'")) == 0:
            # create table if it doesnt exists
            cols = self.version()["describe"]
            col_lst = []
            for col in cols:
                col_type = "TEXT"
                if col["Type"] == "int(11)": col_type = "INTEGER"
                elif col["Type"] == "tinyint(1)": col_type = "INTEGER"
                col_lst.append(f"{col['Field']} {col_type}")
            sql = f"CREATE TABLE '{self.tblName}' ({', '.join(col_lst)})"
            self.__command(sql)
            initial_setup = True

        chunk = 10000
        while chunk > 9999:
            u_date = self.__command(f"SELECT MAX(u_date) AS max FROM {self.tblName}")[0]["max"]
            values = self.__getAll(u_date)
            chunk = len(values)
            #print("\t new rows:", chunk)
            add_lst = []
            for value in values:
                if initial_setup: c_row = []
                else: c_row = self.__command(f"SELECT u_date FROM {self.tblName} WHERE id = ?", [value["id"]])
                if len(c_row) == 0 and value["deleted"] != 1:
                    vals = []
                    cols = []
                    for col, val in value.items():
                        cols.append(col)
                        vals.append(val)
                    cols_txt = ", ".join(cols)
                    val_placeholder = ("?, "*len(vals))[:-2]
                    add_lst.append({"sql":f"INSERT INTO '{self.tblName}' ({cols_txt}) VALUES ({val_placeholder})", "vals": vals})
                elif len(c_row) == 1 and value["deleted"] == 1:
                    add_lst.append({"sql":f"DELETE FROM '{self.tblName}' WHERE id = ?", "vals": [value["id"]]})
                elif len(c_row) == 1 and c_row[0]["u_date"] < value["u_date"]:
                    vals = []
                    sets = []
                    for col, val in value.items():
                        if col != "id":
                            sets.append(f"{col} = ?")
                            #if val == None: vals.append("NULL")
                            #else: vals.append(val)
                            vals.append(val)
                    sets_txt = ", ".join(sets)
                    vals.append(value["id"])
                    add_lst.append({"sql":f"UPDATE '{self.tblName}' SET {sets_txt} WHERE id = ?", "vals": vals})
                elif len(c_row) == 0 and value["deleted"] == 1:
                    pass
                else:
                    raise Exception(f"CANNOT SAVE ROW TO DB: {value} - {c_row}")
            self.__command(add_lst)


    ### EXTERNAL METHODS
    def describe(self):
        '''
            returns schema of current table
        '''
        return self.__command(f"PRAGMA table_info ('{self.tblName}')")

    def version(self):
        '''
            returns dict:
                "max_date" => datetime stamp of update
                "length" => number of rows in table
        '''
        re = self.__call("/info/"+self.tblName)
        return re.json()

    def search(self, query = "*", rCols = "*", oCols = None):
        '''
            query should be a list of dict and defines WHERE-clause:
                {"foo": "bar"}  =>  foo = "bar"
            value can be prefixed:
                {"foo": ">bar"}  =>  foo > "bar"
                {"foo": "<bar"}  =>  foo < "bar"
                {"foo": "-bar"}  =>  foo != "bar"
            * can be used as placeholder:
                {"foo": "bar*"}  =>  foo LIKE "bar%"

            rCols: can be "*" to fetch every column, or list with columns
        '''
        self.__update()
        orderBy = ""
        if oCols:
            orderBy = " ORDER BY "+", ".join(oCols)
        select = "*"
        if rCols != "*": select = ", ".join(rCols)

        where = ""
        if type(query) == dict:
            where = " WHERE "
            where_lst = []
            for k, v in query.items():
                # set operator
                nV = v
                op = "="
                if type(v) == str:
                    if v[0] in [">", "<"]:
                        op = v[0]
                        nV = v[1:]
                    elif v[0] == "-":
                        op = "!="
                        nV = v[1:]
                    elif type(nV) == str and nV.find("*")>-1:
                        op = "LIKE"
                        nV = nV.replace("*", "%")

                #set quotes
                q = "'"
                if f"{nV}".isnumeric(): q = ""

                where_lst.append(f"{k} {op} {q}{nV}{q}")
            where += " AND ".join(where_lst)

        re = self.__command(f"SELECT {select} FROM {self.tblName}{where}{orderBy}")
        return re

    def save(self, values):
        '''
            saves "values" into table. if "id" is given Arachne trys to update, if no a new entry is created.
        '''
        method = "POST"
        url = "/data/"+self.tblName
        if "id" in values.keys():
            method = "PATCH"
            url += f"/{values['id']}"
            del values["id"]
        re = self.__call(url, method=method, data=values)
        self.__update()
        return re.status_code

    def delete(self, rowId):
        '''
            removes a record from the db.
        '''
        method = "DELETE"
        url = f"/data/{self.tblName}/{rowId}"
        re = self.__call(url, method=method)
        self.__update()
        return re.status_code


class Arachne(object):
    def __init__(self, user, pw, url='https://dienste.badw.de:9999', tbls = None, resetDB = False):
        self.__url = url
        re = requests.post(f"{self.__url}/session", json={"user": user, "password": pw})
        if(re.status_code == 200):
            self.__token = re.text
        else:
            raise "login failed."

        self.p = path.dirname(path.abspath(__file__))
        if resetDB and path.exists(self.p+"/arachne.db"): remove(self.p+"/arachne.db")

        if tbls == None: tbls = self.tables()
        for tbl in tbls:
            setattr(self, tbl, ArachneTable(tbl, url, self.__token))

    def close(self):
        ''' call close() at the end of the session to delete active token from server.'''
        re = requests.delete(f"{self.__url}/session", headers={"Authorization": f"Bearer {self.__token}"})
        if(re.status_code == 200):
            del self.__token
        else:
            raise Exception("logout failed.")

    def tables(self):
        ''' shows available tables of current account '''
        re = requests.get(f"{self.__url}/config/oStores", headers={"Authorization": f"Bearer {self.__token}"})
        if(re.status_code == 200):
            oStores = re.json()
            tbls = []
            for oStore in oStores:
                tbls.append(oStore["name"])
            return tbls
        else:
            raise "connection failed."


if __name__ == "__main__":
    user = input(" User: ")
    pw = input(" Passwort: ")
    table = "lemma"
    print(f" |{user}|{pw}")
    reader = Arachne(user, pw, url="https://dienste.badw.de:9996", tbls=[table], resetDB = True)
    #print(f"\t\"{table}\" last updated:", getattr(reader, table).version()["max_date"])
    #if input("download data? (y/n) ").lower() in ["yes", "y"]:
    #    re = getattr(reader, table).search({"in_use": 1}, ["id", "ac_vsc"], ["ac_vsc"])
    #    with open("opera.json", "w", encoding="utf-8") as f:
    #        f.write(json.dumps(re))
    #    print(re)
    reader.close()
