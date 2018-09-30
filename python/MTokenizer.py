# coding: utf8

#!/usr/bin/env python3
from __future__ import unicode_literals
import hazm as Hazm
import sys
from StopWords import stop_words
import re
import json
from wordfreq import zipf_frequency

if len(sys.argv)<2 :
  print('error')
  sys.exit()

raw_text = str(sys.argv[1])

normalizer_instance = Hazm.Normalizer()
lemmatizer_instance = Hazm.Lemmatizer()
stem_finder_instance = Hazm.Stemmer() 
remove_non_persian_regex = re.compile('[^آ-ی]')
raw_text = remove_non_persian_regex.sub(' ', raw_text) #We replace all non persian texts
normalized_text = normalizer_instance.normalize(raw_text)
sentences = Hazm.sent_tokenize(normalized_text)

result_tokens = list()
less_accurate_tokens = list()
def add_to_tokens_if_not_exists(parsed_token):
  exists = False
  for result_token in result_tokens:
    if parsed_token == result_token:
      exists = True
      break
  if exists == False:#Part four:Choose token based on frequency Or search and give score based on frequency
    freq = zipf_frequency(parsed_token,'fa')
    if freq<6:
      result_tokens.append(parsed_token)
    else:
      less_accurate_tokens.append(parsed_token)

for sentence in sentences:
  tokens = Hazm.word_tokenize(sentence)
  for token in tokens:
    if re.match(r'[آ-ی].*',token,re.M|re.I)==False:
      continue
    
    #Part one:Checking if it's verb or noun otherwise continue to next token
    is_stop_word = False
    for stop_word in stop_words:
      if stop_word==token:
        is_stop_word = True
        break

    if(is_stop_word):
      continue  

    #Part two:Checking if it is a verb
    find_word_root_result = lemmatizer_instance.lemmatize(token)
    word_root_array = find_word_root_result.split('#')
    if len(word_root_array) == 2:#Means it is a word
      add_to_tokens_if_not_exists(word_root_array[1])
      continue
      
    modified_token = token+'م'
    word_root_array = find_word_root_result.split('#')
    if len(word_root_array) == 2:#Means it is a word
      add_to_tokens_if_not_exists(word_root_array[1])
      continue
    
    #Part three:Getting stem of noun
    token_stem = stem_finder_instance.stem(token)
    add_to_tokens_if_not_exists(token_stem)

#Part five:Add more frequency tokens is result is empty
if(len(result_tokens)!=0):
  print(json.dumps(result_tokens))
else:
  print(json.dumps(less_accurate_tokens))
sys.exit()