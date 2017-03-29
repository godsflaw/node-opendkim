#ifndef LIBOPENDKIM_H
#define LIBOPENDKIM_H

#include <iostream>
#include <stdlib.h>
#include <string.h>
#include <node.h>
#include <nan.h>
#include <node_object_wrap.h>
#include <stdbool.h>
#include <opendkim/dkim.h>

namespace opendkim {

using namespace std;
using namespace v8;
using namespace Nan;

class OpenDKIM : public Nan::ObjectWrap {
  public:
    static NAN_MODULE_INIT(Init);

    // Administration methods
    static NAN_METHOD(New);
    static NAN_METHOD(FlushCache);

    // Processing methods
    static NAN_METHOD(Header);
    static NAN_METHOD(EOH);
    static NAN_METHOD(Body);
    static NAN_METHOD(EOM);
    static NAN_METHOD(Chunk);

    // Signing methods
    static NAN_METHOD(Sign);

    // Verifying methods
    static NAN_METHOD(Verify);

  private:
    explicit OpenDKIM();
    ~OpenDKIM();

    static inline Nan::Persistent<v8::Function> &constructor() {
      static Nan::Persistent<v8::Function> my_constructor;
      return my_constructor;
    }

    static inline void throw_error(DKIM_STAT result) {
      const char *msg = dkim_getresultstr(result);

      if (msg != NULL) {
        Nan::ThrowError(msg);
      } else {
        Nan::ThrowError("sign(): an unknown error occurred");
      }

      return;
    }

    // The user of this function must free retval in the caller if the function
    // return success.
    static inline int _value_to_char(v8::Local<v8::Value> obj, const char *key, char **retval) {
      Local<Value> val = Nan::Get(
        obj.As<Object>(), Nan::New(key).ToLocalChecked()
      ).ToLocalChecked();
      Nan::Utf8String str(val);
      char *strval = *str;

      int val_size = strlen(strval);
      *retval = (char *)malloc(sizeof(char) * (val_size + 1));
      if(*retval == NULL) {
        Nan::ThrowTypeError("_value_to_char: out-of-memory");
        return 0;
      }
      memcpy(*retval, strval, val_size);
      (*retval)[val_size] = '\0';

      if (strcmp(*retval, "undefined") == 0) {
        _safe_free(&(*retval));
        return 0;
      } else {
        return 1;
      }
    }

    static inline int _value_to_int(v8::Local<v8::Value> obj, const char *key) {
      Local<Value> val = Nan::Get(
        obj.As<Object>(), Nan::New(key).ToLocalChecked()
      ).ToLocalChecked();
      return val->Int32Value();
    }

    static inline bool _value_to_bool(v8::Local<v8::Value> obj, const char *key) {
      Local<Value> val = Nan::Get(
        obj.As<Object>(), Nan::New(key).ToLocalChecked()
      ).ToLocalChecked();
      return val->BooleanValue();
    }

    static inline void _safe_free(char **ptr) {
      if (*ptr != NULL) {
        free(*ptr);
        *ptr = NULL;
      }
    }

    // private variables
    DKIM *dkim;
    DKIM_LIB *dkim_lib;
};

}

#endif
