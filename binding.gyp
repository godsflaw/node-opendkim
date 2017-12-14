{
    "targets": [{
        "target_name": "opendkim",
        "sources": [
            "src/opendkim_sign_async.cc",
            "src/opendkim.cc",
        ],
        "include_dirs": [
           "<!(node -e \"require('nan')\")"
        ],
        "libraries": [
            "-lopendkim"
        ]
    }]
}
