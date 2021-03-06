{
    "targets": [{
        "target_name": "opendkim",
        "sources": [
            "src/opendkim_body_async.cc",
            "src/opendkim_chunk_async.cc",
            "src/opendkim_chunk_end_async.cc",
            "src/opendkim_eoh_async.cc",
            "src/opendkim_eom_async.cc",
            "src/opendkim_flush_cache_async.cc",
            "src/opendkim_header_async.cc",
            "src/opendkim_sign_async.cc",
            "src/opendkim_verify_async.cc",
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
