from joblib import dump, load
import matplotlib.pyplot as plt
#import pickle
import pandas
import re
#from sklearn import linear_model
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import r2_score, accuracy_score

from arachne import Arachne

db = Arachne("alexander.haeberlin@mlw.badw.de", "mitfex-3wibSu-patxam", "https://dienste.badw.de:9999", ["zettel"], False)
print("database loaded.")

zettelLst = db.zettel.search({"ocr_text": ">"}, ["id", "type", "ocr_text", "ac_web"])
print("all zettel with ocr:", len(zettelLst))

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

train_x = X[:80]
train_y = y[:80]

test_x = X[80:]
test_y = y[80:]

#logisticRegr = LogisticRegression()
#logisticRegr.fit(X, y)
logisticRegr = load("typeModel.joblib")
#dump(logisticRegr, "typeModel.joblib")

print("score logistic:", logisticRegr.score(test_x, test_y))


#pickle.dumps(logisticRegr)

#pred_y = logisticRegr.predict(test_x)
#print("accuracy:", accuracy_score(test_y, pred_y))

#regr = linear_model.LinearRegression()
#regr.fit(train_x, train_y)
#pred_y = regr.predict(test_x)
#print(r2_score(test_y, pred_y))


knn = KNeighborsClassifier(n_neighbors=1)
knn.fit(train_x, train_y)
pred_y = knn.predict(test_x)
print("score knn:", accuracy_score(test_y, pred_y))
#print("score knn:", nbrs.score(test_x, test_y))