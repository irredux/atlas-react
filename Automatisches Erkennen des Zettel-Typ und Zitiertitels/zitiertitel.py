from configparser import ConfigParser
#from fuzzywuzzy import fuzz
from fuzzysearch import find_near_matches
import matplotlib.pyplot as plt
import pandas
import re
#from sklearn import linear_model
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import r2_score, accuracy_score

from arachne import Arachne

#cfg = ConfigParser()
#cfg.read("config/localhost.ini")
#db = Arachne(cfg['database'])
db = Arachne("alexander.haeberlin@mlw.badw.de", "mitfex-3wibSu-patxam", "https://dienste.badw.de:9999", ["zettel", "work"], False)
print("database loaded.")

zettelLst = db.zettel.search({"ocr_text": ">"}, ["id", "type", "ocr_text", "ac_web"])
print("all zettel with ocr:", len(zettelLst))
works = db.work.search({"id": ">0"}, ["id", "ac_web"])

def sortWorks(item):
    return item["ac_web"]
works.sort(key=sortWorks, reverse=True)

zettelData = []
for zettel in zettelLst:
    if zettel["type"] in [2, 3]:
        zettel["ocr_length"] = len(zettel["ocr_text"])
        zettel["letter_length"] = len(re.findall("[a-z]", zettel["ocr_text"], re.IGNORECASE))
        zettel["word_length"] = len(re.findall("[a-z][a-z]+", zettel["ocr_text"], re.IGNORECASE))
        zettel["numbers_length"] = len(re.findall("[0-9]", zettel["ocr_text"], re.IGNORECASE))
        zettel["letter_ratio"] = 100/len(zettel["ocr_text"])*len(re.findall("[a-z]", zettel["ocr_text"], re.IGNORECASE))
        zettelData.append(zettel)

print("data found:", len(zettelData))
data = pandas.DataFrame(zettelData)

X = data[["ocr_length", "letter_length", "word_length"]] # 0.9392538097740409
#X = data[["ocr_length", "letter_length"]] # 0.9346295323173935
#X = data[["ocr_length", "letter_ratio"]] # 0.8982658959537573
#X = data[["letter_length"]] # 0.8669469259064635
#X = data[["ocr_length"]] # 0.7777193904361535
y = data["type"]
print(X.head(10))

train_x = X[:80]
train_y = y[:80]

test_x = X[80:]
test_y = y[80:]

logisticRegr = LogisticRegression()
logisticRegr.fit(train_x, train_y)
print("score:", logisticRegr.score(test_x, test_y))

#pred_y = logisticRegr.predict(test_x)
#print("accuracy:", accuracy_score(test_y, pred_y))

#regr = linear_model.LinearRegression()
#regr.fit(train_x, train_y)
#pred_y = regr.predict(test_x)
#print(r2_score(test_y, pred_y))


### get work!
total = 0
found = 0
correct_found = 0
loop_count = 0
zettel_count = 0
#fuzzy = 0
#distance = 4
for checkWork in zettelLst:
    zettel_count += 1
    if checkWork["ac_web"]!=None and checkWork["type"] in [1,2,3]:
        total += 1
        break_loop = False
        found_word = None
        for work in works:
            max_range = 3
            if len(work["ac_web"]) < 6: max_range = 2
            if work["ac_web"] == "ALBERT. M. anim.": max_range = 1
            for dist in range(0,max_range):
                matches = find_near_matches(work["ac_web"], checkWork["ocr_text"], max_l_dist=dist)
                if len(matches) > 0 and found_word == None:
                    if dist == 0: break_loop = True
                    found_word = work["ac_web"]
                    break
                elif len(matches) > 0 and found_word != None:
                    foudn_word = None
                    break_loop = True
                    break
            if break_loop: break
        if found_word:
            found += 1
        if found_word == checkWork["ac_web"]:
            correct_found += 1
        elif found_word:
            print("wrong match:", checkWork["ac_web"], "|||", found_word)
        loop_count += 1
    if loop_count > 500:
        loop_count = 0
        print(round(100/len(zettelLst)*zettel_count,1), "%")

    #if total > 200: break
print("total:", total)
print("found:", round(100/total*found,1), "%")
print("correct found:", round(100/total*correct_found,1), "%")
print("score", round(1/found*correct_found,5))

#print("fuzzy:", round(100/total*fuzzy,1), "%")


# https://pypi.org/project/fuzzysearch/
# https://stackoverflow.com/questions/17740833/checking-fuzzy-approximate-substring-existing-in-a-longer-string-in-python


       #if checkWork["ocr_text"].find(checkWork["ac_web"])>-1:
        #    found += 1
        #if find_near_matches(checkWork["ac_web"], checkWork["ocr_text"], max_l_dist=distance):
        #    fuzzy += 1
        
        #matched = 0
        #for work in works:
        #    fuzzy_work = find_near_matches(work["ac_web"], checkWork["ocr_text"], max_l_dist=distance)
        #    if fuzzy_work:
        #        matched += 1
        #if matched > 1:
        #    print("multi:", checkWork["ac_web"], matched)
        #    multiple_matches += 1
