{
    "targets": [{
        "target_name": "opendkim",
        "sources": [
            "src/opendkim_body_async.cc",
            "src/opendkim_eoh_async.cc",
            "src/opendkim_eom_async.cc",
            "src/opendkim_header_async.cc",
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
