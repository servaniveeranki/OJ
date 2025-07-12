#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <unordered_set>
using namespace std;

int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
    // Create a set for O(1) lookups and to mark visited words
    unordered_set<string> wordSet(wordList.begin(), wordList.end());
    
    // If endWord is not in wordList, return 0
    if (wordSet.find(endWord) == wordSet.end()) return 0;
    
    // BFS queue with word and its level
    queue<pair<string, int>> q;
    q.push({beginWord, 1});
    
    // Remove beginWord from wordSet to mark as visited
    wordSet.erase(beginWord);
    
    while (!q.empty()) {
        string word = q.front().first;
        int level = q.front().second;
        q.pop();
        
        // Try changing each character of the word
        for (int i = 0; i < word.length(); i++) {
            string temp = word;
            
            // Try all possible characters
            for (char c = 'a'; c <= 'z'; c++) {
                temp[i] = c;
                
                // Skip if the character is the same
                if (temp == word) continue;
                
                // If we found the endWord, return the level + 1
                if (temp == endWord) return level + 1;
                
                // If the transformed word is in wordSet
                if (wordSet.find(temp) != wordSet.end()) {
                    q.push({temp, level + 1});
                    wordSet.erase(temp); // Mark as visited
                }
            }
        }
    }
    
    return 0; // No transformation sequence found
}
