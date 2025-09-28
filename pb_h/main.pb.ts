onRecordAfterCreateSuccess((e) => {
    const comments = e.record
    const notification = new Record($app.findCollectionByNameOrId("notifications"))
    notification.set("posts", comments?.get("posts"))
    notification.set("owner", comments?.get("user"))
    notification.set("post", comments?.get("post"))
    notification.set("comment", comments?.id)
    $app.save(notification)
    e.next()
}, "comments")
