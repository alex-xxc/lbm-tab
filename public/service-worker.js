
// 监听窗口焦点变化事件
chrome.windows.onFocusChanged.addListener(windowId => {
    chrome.runtime.sendMessage({ action: 'windowFocusChanged', windowId: windowId });
});

// 监听窗口创建事件
chrome.windows.onCreated.addListener(window => {
    chrome.runtime.sendMessage({ action: 'windowCreated', window: window });
});
// 监听窗口删除事件
chrome.windows.onRemoved.addListener(window => {
    chrome.runtime.sendMessage({ action: 'windowRemoved', windowId: window });
});

// 监听标签页创建事件
chrome.tabs.onCreated.addListener(tab => {
    chrome.runtime.sendMessage({ action: 'tabCreated', tab: tab });
});

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.runtime.sendMessage({ action: 'tabUpdated', tabId: tabId, changeInfo: changeInfo, tab: tab });
});

// 监听标签页关闭事件
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.runtime.sendMessage({ action: 'tabRemoved', tabId: tabId, removeInfo: removeInfo });
});

// 监听标签页移动事件
chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
    chrome.runtime.sendMessage({ action: 'tabMoved', tabId: tabId, moveInfo: moveInfo });
});