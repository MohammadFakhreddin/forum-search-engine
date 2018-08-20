from hazm import Normalizer,POSTagger,Stemmer
import sys
import json

if len(sys.argv)<2 :
  print('error')
  sys.exit()

raw_text = sys.argv[1]
normalizer_instance = Normalizer()
normalized_text = normalizer_instance.normalize(raw_text)
tagger_instance = POSTagger('resources/postagger.model')
taggedList = tagger_instance.tag(normalized_text)
stem_finder_instance = Stemmer()
stems = list()
for tag in taggedList:
  if(tag[1]=='N'):
    stem = stem_finder_instance.stem(tag[1])
    stems.append(stem)
    
print(json.dumps(stems))
sys.exit()
